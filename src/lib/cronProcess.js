let CronJob = require('cron').CronJob,
    jsonfile = require('jsonfile'),
    smtp = require('./smtp'),
    path = require('path'),
    fs = require('fs-extra'),
    exec = require('madscience-node-exec'),
    logger = require('./logger'),
    settings = require('./settings'),
    transportHandlers = {
        smtp : smtp
    }

module.exports = class CronProcess
{
    constructor(config){

        this.config = config
        this.log = logger.instanceWatcher(config.__name)
        this.isPassing = false
        this.errorMessage = this.config.__errorMessage || 'Checking has not run yet'
        this.busy = false
        this.lastRun = new Date()
        this.nextRun = new Date()
        this.recipients = []
        
        // recipients is optional. It is a list of strings which must correspond to "name" values in objects in settings.people array.
        if (!this.config.recipients)
            this.config.recipients = []
            
        if (typeof this.config.recipients === 'string')
            this.config.recipients = this.config.recipients.split(',').filter((r)=> { return !!r.length })

        for (let recipientName of this.config.recipients){
            let recipientObject = settings.recipients[recipientName]

            if (!recipientObject){
                this.log.error(`Recipient "${recipientName}" in watcher ${this.config.__name} could not be matched to a recipient in settings.`)
                continue
            }

            this.recipients.push(recipientObject)
        }

        this.calcNextRun()
    }

    calcNextRun(){
        if (this.cron)
            this.nextRun = new Date(this.cron.nextDates().toString())
    }

    start(){
        
        this.log.info(`Starting watcher "${this.config.name || this.config.__name}"`)
        this.cron = new CronJob(this.config.interval, async()=>{

            try
            {
                if (this.config.__hasErrors)
                    return

                if (this.busy){
                    this.log.info(`${this.config.__name} check was busy from previous run, skipping`);
                    return
                }
        
                this.busy = true
                await this.work()

            } catch (ex){
                this.log.error(ex)
            } finally {
                this.busy = false
            }
        }, null, true, null, null, true /*runonitit*/)
    }

    stop(){
        this.cron.stop()
    }

    async work(){
        this.lastRun = new Date()
        let testRun = ''

        try {

            if (this.config.cmd){
                testRun = this.config.cmd

                let thisConfigString = ''
                //for (const prop in this.config)
                //    thisConfigString += ` --${prop} ${this.config[prop]}`

                let result = await exec.sh({ cmd : `${this.config.cmd} ${thisConfigString}` })
                if (result.code === 0) {
                    this.isPassing = true
                    this.errorMessage = null
                } else {
                    const errorMessage = `${result.result} (code ${result.code})`
                    this.errorMessage = errorMessage
                    this.log.info(errorMessage)
                    this.isPassing = false
                }
            } else {
                
                let testname = this.config.test ? 
                        this.config.test 
                        : 'net.httpCheck',
                    test = require(`../tests/${testname}`)
                
                testRun = testname
                await test.call(this, this.config)
                // if reach here, no exception thrown, so test passed
                this.isPassing = true
                this.errorMessage = null
            }

        } catch(ex){
            if (ex.type === 'configError'){
                this.config.__hasErrors = true
                this.errorMessage = ex.text  
            } else if (ex.type === 'awdtest.fail'){
                this.log.info(`Watcher "${this.config.__name}" test "${ex.test}" failed.`, ex.text)
                this.errorMessage = ex.text 
            } else {
                this.log.error(`Unhandled exception running "${testRun}"`, ex)
                this.errorMessage = `Unhandled exception:${ex.toString()}` 
            }

            this.isPassing = false
        }


        this.calcNextRun()

        
        if (this.errorMessage)
            this.log.info(this.errorMessage)

        let downFlag = path.join(settings.logs, this.config.__safeName, 'flag'),
            statusChanged = false,
            historyLogFolder = path.join(settings.logs, this.config.__safeName, 'history');

        if (this.isPassing){
            await fs.ensureDir(historyLogFolder);

            jsonfile.writeFileSync(path.join(historyLogFolder, `status.json`), {
                status : 'up',
                url : this.config.url,
                date : this.lastRun
            })

            if (await fs.exists(downFlag)){
                // site is back up after fail was previous detected, clean up flag and write log
                await fs.remove(downFlag)

                jsonfile.writeFileSync(path.join(historyLogFolder, `${this.lastRun.getTime()}.json`), {
                    status : 'up',
                    url : this.config.url,
                    date : this.lastRun
                })

                this.log.info(`Status changed, "${this.config.__name}" is passing.`)
                statusChanged = true
            }

            // if no history exists, write start entry, status flag counts for 1, history will be 1 more
            if ((await fs.readdir(historyLogFolder)).length < 2)
                jsonfile.writeFileSync(path.join(historyLogFolder, `${this.lastRun.getTime()}.json`), {
                    status : 'up',
                    url : this.config.url,
                    date : this.lastRun
                })

        } else {

            if (!await fs.exists(downFlag)){

                await fs.ensureDir(historyLogFolder);

                // site is down, write fail flag and log
                jsonfile.writeFileSync(downFlag, {
                    url : this.config.url,
                    date : new Date()
                })

                jsonfile.writeFileSync(path.join(historyLogFolder, `${this.lastRun.getTime()}.json`), {
                    status : 'down',
                    url : this.config.url,
                    date : new Date()
                });
                
                jsonfile.writeFileSync(path.join(historyLogFolder, `status.json`), {
                    status : 'down',
                    url : this.config.url,
                    date : this.lastRun
                });

                this.log.info(`Status changed, "${this.config.__name}" is failing.`)
                statusChanged = true
            }
        }

        // send email if site status has change changed
        if (statusChanged){
            this.log.debug(`Status changed detected for job ${this.config.__name}`)
            let subject = this.isPassing ? `SUCCESS: ${this.config.__name} is up` : `WARNING: ${this.config.__name} is down`,
                message = this.isPassing ? `${this.config.__name} is up` : `${this.config.__name} is down`
            
            for (const transportName in settings.transports){
                const transport = settings.transports[transportName]
                if (!transport.enabled){
                    this.log.debug(`${transportName} is disabled, not using`)
                    continue
                }

                const transportHandler = transportHandlers[transportName]
                if (!transportHandler){
                    this.log.error(`ERROR : no handler defined for transport ${transportName}`)
                    continue
                }
                    
                this.log.debug(`Attempting to send notification changed detected for job ${transportName}`)

                for (let recipientName of this.config.recipients){
                    const recipient = settings.recipients[recipientName]
                    if (!recipient){
                        this.log.error(`Recipient name "${recipientName}" is invalid. Name must be listed under "recipients" node in settings.yml`)
                        continue
                    }

                    if (!recipient.enabled){
                        this.log.debug(`Recipient ${recipient} disabled, bypassing all alerts for them.`)
                        continue
                    }

                    // handle email via smtp
                    if (recipient.smtp){
                        let result = await transportHandler.send(recipient.smtp, subject, message)
                        this.log.info(`Sent email to ${recipient.smtp} for process ${this.config.__name}. Result: `, result)
                    }

                    // handle slack
                }                    

            }
        }

    }
}
