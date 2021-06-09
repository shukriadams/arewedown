module.exports = class {

    constructor(config = {}){

        const logger = require('./logger')

        this.config = config
        this.log = logger.instanceWatcher(config.__name)
        this.isPassing = false
        this.errorMessage = this.config.__errorMessage || 'Checking has not run yet'
        this.busy = false
        this.lastRun = new Date()
        this.nextRun = new Date()
    }

    calcNextRun(){
        if (this.cron)
            this.nextRun = new Date(this.cron.nextDates().toString())
    }

    start(){
        const CronJob = require('cron').CronJob

        this.log.info(`Starting watcher "${this.config.name || this.config.__name}"`)
        this.cron = new CronJob(this.config.interval, this.tick.bind(this), null, true, null, null, true /*runonitit*/)
        this.calcNextRun()
    }
    
    async tick(){
        try
        {
            if (this.config.__hasErrors)
                return

            if (this.busy){
                this.log.info(`${this.config.__name} check was busy from previous run, skipping`);
                return
            }
    
            this.busy = true
            await this.doTest()

        } catch (ex){
            this.log.error(ex)
        } finally {
            this.busy = false
        }
    }

    async doTest(){
        const history = require('./history'),
            exec = require('madscience-node-exec')

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
                this.log.error(this.errorMessage)  
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

        // write state of watcher to filesystem
        let status = null
        if (this.isPassing)
            status = await history.writePassing(this.config.__safeName, this.lastRun)
        else 
            status = await history.writeFailing(this.config.__safeName, this.lastRun, this.errorMessage)

        // send alerts if status changed
        if (status.changed){
            this.log.info(`Status changed, "${this.config.__name}" is ${this.isPassing? 'passing': 'failing'}.`)
            this.sendAlerts()
        }
    }

    async sendAlerts(){
        let settings = require('./settings').get(),
            smtp = require('./smtp'),
            transportHandlers = {
                smtp
            }
        
        for (const transportName in settings.transports){
            const transportHandler = transportHandlers[transportName]
            if (!transportHandler){
                this.log.error(`ERROR : no handler defined for transport ${transportName}`)
                continue
            }

            for (let recipientName of this.config.recipients){
                const recipient = settings.recipients[recipientName]
                for (let recipientMethod in recipient){
                    let result = await transportHandler.send(recipient[recipientMethod], this.config.__name, this.isPassing)
                    this.log.info(`Sent alert to ${recipient[recipientMethod]} for process ${this.config.__name}. Result: `, result)
                }
            }
        }
    }
}