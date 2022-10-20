/**
 * Defines a type that performs checks at intervals.
 */
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

    start(){
        const CronJob = require('cron').CronJob

        this.log.info(`Starting watcher "${this.config.name || this.config.__name}"`)
        this.cron = new CronJob(this.config.interval, this.tick.bind(this), null, true, null, null, true /*tick immediately on itit*/)
        this.calcNextRun()
    }

    stop(){
        if (!this.cron)
            return

        this.cron.stop()
    }

    calcNextRun(){
        const timebelt = require('timebelt')

        if (this.cron)
            this.nextRun = timebelt.addMilliseconds(new Date(this.cron.nextDates().toString()), this.config.offset)
    }

    /**
     * Callback attached to this.cron. Cron calls this at the test interval
     */
    async tick(){
        setTimeout(async()=>{
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
        }, this.config.offset)
       
    }


    /**
     * The "business" function of the watcher, responsible for executing and handling result of whatever we're testing for. We keep this
     * separate from tick() for readability, and mostly to make it easier to run unit tests on doTest
     */
    async doTest(){
        const history = require('./history'),
            exec = require('madscience-node-exec')

        this.lastRun = new Date()
        let testRun = ''
        this.calcNextRun()

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

                // get test to run, if none is set, fall back to httpCheck as default
                let testname = this.config.test ? 
                        this.config.test 
                        : 'net.httpCheck', 
                    test = require(`../tests/${testname}`)
                
                testRun = testname

                // This is where the business of AWD? runs, this executes the test for a given watcher
                await test.call(this, this.config)

                // if reach here, no exception thrown, so test passed
                this.isPassing = true
                this.errorMessage = null
            }

        } catch(ex){

            // the watcher testfailed, try to figure out how

            if (ex.type === 'configError'){
                // Tests have the option of throwing explicit 'configError' errors, this lets us write test-specific config checks.
                // If one is thrown, the test can be marked as having invalid config, which in turn can be shown the UI, aiding in
                // visually identifying the issue.
                this.config.__hasErrors = true
                this.errorMessage = ex.text
                this.log.error(this.errorMessage)  
            } else if (ex.type === 'awdtest.fail'){
                // Tests should throw the 'awdtest.fail' error explicitly if whatever condition they test for isn't met, we can then
                // treat those tests as failing expectedly
                this.log.info(`Watcher "${this.config.__name}" test "${ex.test}" failed.`, ex.text)
                this.errorMessage = ex.text 
            } else {
                // oops, something unplanned happened.
                this.log.error(`Unhandled exception running "${testRun}"`, ex)
                this.errorMessage = `Unhandled exception:${ex.toString()}` 
            }

            this.isPassing = false
        }


        // write state of watcher to filesystem
        let status = null
        if (this.isPassing)
            status = await history.writePassing(this.config.__safeName, this.lastRun)
        else 
            status = await history.writeFailing(this.config.__safeName, this.lastRun, this.errorMessage)

        // send alerts if status changed
        if (status.changed){
            this.log.info(`Status changed, "${this.config.__name}" is ${this.isPassing? 'passing': 'failing'}.`)
            this.queueAlerts()
        }
    }

    async queueAlerts(){
        const settings = require('./settings').get(),
            fs = require('fs-extra'),
            path = require('path'),
            transportHandlers = require('./transports').getTransportHandlers()
        
        for (const transportName in settings.transports){
            const transportHandler = transportHandlers[transportName]
            if (!transportHandler){
                this.log.error(`ERROR : no handler defined for transport ${transportName}`)
                continue
            }

            for (const recipientName of this.config.recipients){
                const recipient = settings.recipients[recipientName]

                if (!recipient[transportName])
                    continue

                try {
                    const receiverNameBase64 = Buffer.from(recipientName).toString('base64'),
                        watcherNameBase64 = Buffer.from(this.config.__name).toString('base64'),
                        dir = path.join(settings.queue, transportName, receiverNameBase64)

                    await fs.ensureDir(dir)
                    await fs.writeJson(path.join(dir, watcherNameBase64), {
                        isPassing : this.isPassing
                    })

                    this.log.info(`queued alert to ${recipient[transportName]} via transport ${transportName} for process ${this.config.__name}. `)
                } catch (ex) {
                    this.log.error(`Error queuing alert to ${recipient[transportName]} via transport ${transportName} for process ${this.config.__name} : `, ex)
                }
            }
        }
    }
}