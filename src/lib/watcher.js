let smtp = require('./smtp'),
    exec = require('madscience-node-exec'),
    history = require('./history'),
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
    }

    calcNextRun(){
        if (this.cron)
            this.nextRun = new Date(this.cron.nextDates().toString())
    }

    start(){
        const CronJob = require('cron').CronJob

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
                await this.tick()

            } catch (ex){
                this.log.error(ex)
            } finally {
                this.busy = false
            }

        }, null, true, null, null, true /*runonitit*/)

        this.calcNextRun()
    }

    async tick(){
        this.lastRun = new Date()
        let testRun = ''

        try {

            if (this.config.cmd){
                testRun = this.config.cmd

                let thisConfigString = ''
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

        // write state of watcher to filesystem
        let status = null
        if (this.isPassing)
            status = await history.writePassing(this.config.__safeName, this.lastRun)
        else 
            status = await history.writeFailing(this.config.__safeName, this.lastRun)

        if (status.changed) 
            this.log.info(`Status changed, "${this.config.__name}" is ${this.isPassing? 'passing': 'failing'}.`)

        // send alerts if status changed
        if (status.changed){
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