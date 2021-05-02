let CronJob = require('cron').CronJob,
    jsonfile = require('jsonfile'),
    smtp = require('./smtp'),
    path = require('path'),
    fs = require('fs-extra'),
    exec = require('madscience-node-exec'),
    logger = require('./logger'),
    settings = require('./settings')

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
        this.errorMessage = null
        
        // revert to system/net.httpcheck if test name is not explicitly set.
        
        let testRun = ''

        try {

            if (this.config.cmd){
                testRun = this.config.cmd

                let thisConfigString = ''
                for (const prop in this.config)
                    thisConfigString += ` --${prop} ${this.config[prop]}`

                let result = await exec.sh({ cmd : `${this.config.cmd} ${thisConfigString}` })
                if (result.code === 0) {
                    this.isPassing = true
                } else {
                    const errorMessage = `${result.result} (code ${result.code})`
                    this.errorMessage = errorMessage
                    this.log.info(errorMessage)
                    this.isPassing = false
                }
            } else {
                this.isPassing = true
                let testname = this.config.test ? 
                        this.config.test 
                        : 'net.httpCheck',
                    test = require(`../tests/${testname}`)
                
                testRun = testname

                await test.call(this, this.config)
            }

        } catch(ex){
            if (ex.type === 'configError'){
                this.config.__hasErrors = true
                this.errorMessage = ex.text  
            } else if (ex.type === 'awdtest.fail'){
                this.log.info(`Watcher "${this.config.__name}" test "${ex.test}" failed.`, ex.text)
            } else {
                this.log.error(`Unhandled exception running "${testRun}"`, ex)
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

                this.log.info(`Status changed, flag removed for ${this.config.__name}`)
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

                this.log.info(`Status changed, flag created for ${this.config.__name}`)
                statusChanged = true
            }
        }

        // send email if site status has change changed
        if (statusChanged){
            this.log.debug(`Status changed detected for job ${this.config.__name}`)
            let subject = this.isPassing ? `${this.config.__name} is up` : `${this.config.__name} is down`,
                message = this.isPassing ? `${this.config.__name} is up` : `${this.config.__name} is down`,
                sendMethod = settings.transports.smtp ? 
                    smtp :
                    null

            if (sendMethod){
                this.log.debug(`Attempting to send notification changed detected for job ${sendMethod}`)
                for (let recipientName of this.config.recipients){
                    const recipient = settings.recipients[recipientName]
                    if (!recipient.enabled){
                        this.log.error(`Recipient name "${recipientName}" is invalid. Name must be listed under "recipients" node in settings.yml`)
                        continue
                    }

                    if (!recipient.enabled){
                        this.log.debug(`Recipient ${recipient} disabled, bypassing all alerts for them.`)
                        continue
                    }

                    // handle email
                    if (recipient.email){
                        let result = await sendMethod.send(recipient.email, subject, message)
                        this.log.info(`Sent email to ${recipient.email} for process ${this.config.__name}. Result: `, result)
                    }

                    // handle slack
                }
            }
        }

    }
}
