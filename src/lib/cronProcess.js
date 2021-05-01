let CronJob = require('cron').CronJob,
    jsonfile = require('jsonfile'),
    smtp = require('./smtp'),
    path = require('path'),
    fs = require('fs-extra'),
    exec = require('madscience-node-exec'),
    logger = require('./logger'),
    settings = require('./settings')

class CronProcess
{
    constructor(config){

        this.config = config
        this.logInfo = logger.instanceWatcher(config.__name).info.info
        this.logError = logger.instanceWatcher(config.__name).error.error
        this.isPassing = false
        this.config.__errorMessage = this.config.__errorMessage || 'Checking has not run yet'
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
                this.logError(`Recipient "${recipientName}" in watcher ${this.config.__name} could not be matched to a recipient in settings.`)
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
        
        this.logInfo(`Starting watcher "${this.config.name || this.config.__name}"`)
        console.log(`Starting watcher "${this.config.name || this.config.__name}"`)
        this.cron = new CronJob(this.config.interval, async()=>{

            try
            {
                if (this.config.__hasErrors)
                    return

                if (this.busy){
                    this.logInfo(`${this.config.__name} check was busy from previous run, skipping`);
                    return
                }
        
                this.busy = true
                await this.work()

            } catch (ex){
                this.logError(ex)
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
        this.config.__errorMessage = null
        
        // revert to system/net.httpcheck if test name is not explicitly set.
        
        let testRun = ''

        try {
            this.isPassing = true

            if (this.config.cmd){
                testRun = this.config.cmd

                let thisConfigString = ''
                for (const prop in this.config)
                    thisConfigString += ` --${prop} ${this.config[prop]}`

                let result = await exec.sh({ cmd : `${this.config.cmd} ${thisConfigString}` })
                if (result.code !== 0) {
                    const errorMessage = `${result.result} (code ${result.code})`
                    this.config.__errorMessage = errorMessage
                    this.logError(errorMessage)
                    this.isPassing = false
                }
            } else {
                let testname = this.config.test ? 
                        this.config.test 
                        : 'net.httpCheck',
                    test = require(`../tests/${testname}`)
                
                testRun = testname

                await test.call(this, this.config)
            }

        } catch(ex){
            this.logError(`Unhandled exception running "${testRun}"`, ex)
            this.isPassing = false;
            this.config.__errorMessage = ex.errno === 'ENOTFOUND' || ex.errno === 'EAI_AGAIN' ? 
                `${this.config.url} could not be reached.` 
                : ex
        }


        this.calcNextRun()

        
        if (this.config.__errorMessage)
            this.logInfo(this.config.__errorMessage)

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

                this.logInfo(`Status changed, flag removed for ${this.config.__name}`)
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

                this.logInfo(`Status changed, flag created for ${this.config.__name}`);
                statusChanged = true;
            }
        }

        // send email if site status has change changed
        if (statusChanged){

            let subject = this.isPassing ? `${this.config.__name} is up` : `${this.config.__name} is down`,
                message = this.isPassing ? `${this.config.__name} is up` : `${this.config.__name} is down`,
                sendMethod = settings.transports.smtp ? smtp :
                    settings.slack ? sendgrid :   
                    null

            if (sendMethod){
                for (let recipient of this.recipients){
                    if (!recipient.enabled)
                        continue

                    // handle email
                    if (recipient.email){
                        let result = await sendMethod(recipient.email, subject, message)
                        this.logInfo(`Sent email to ${recipient.email} for process ${this.config.__name} with result : ${result}` )
                    }

                    // handle slack
                }
            }
        }

    }
}

module.exports = CronProcess