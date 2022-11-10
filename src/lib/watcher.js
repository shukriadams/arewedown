/**
 * Defines a type that performs checks at intervals.
 */
module.exports = class {

    constructor(config = {}){

        const logger = require('./logger')

        this.config = config
        this.log = logger.instanceWatcher(config.__name)
        this.errorMessage = this.config.__errorMessage || ''
        
        // true when this watcher is running a test. Prevents concurrent tests if a test takes longer than
        // the watcher test interval
        this.busy = false

        // Datetime this watcher last did its test
        this.lastRun = null

        // Datetime this watcher will next run a test
        this.nextRun = null

        // time watcher entered its current pass/fail state.
        // Restored from status.json on app start
        this.enteredStatusTime = new Date()

        // human-friendly timespan representation of Now - this.enteredStatusTime. Used to show user how long
        // watcher has been in current state. Generated on-demand in this.calculateDisplayTimes
        this.timeInState = '' 
        
        // human-friendly datetime representation when this watcher will test again. Generated on-demand by 
        // this.calculateDisplayTimes
        this.next = ''

        // can be up|down|pending. Pending means it hasn't run yet, and has no history
        this.status = 'pending' 
    }

    async start(){
        const CronJob = require('cron').CronJob,
            history = require('./history'),
            thisExistingStatus = await history.getStatus(this.config.__safeName)

            if (!this.config.cmd){
                // get test to run, if none is set, fall back to httpCheck as default
                let testname = this.config.test ? 
                        this.config.test 
                        : 'net.httpCheck', 
                    test = require(`../tests/${testname}`)

                try {
                    test.validateConfig.call(this, this.config)
                } catch(ex){
                    // Tests can throw an explicit 'configError' error, if their configuraiton conditions are not met.
                    // If thrown, the test is marked as having invalid config, which in turn can be shown on the UI, aiding in
                    // visually identifying an issue.
                    this.config.__hasErrors = true
                    this.errorMessage = ex.text || ex
                }
            }


        if (thisExistingStatus && thisExistingStatus.date)
            this.enteredStatusTime = thisExistingStatus.date

        if (thisExistingStatus && thisExistingStatus.status)
            this.status = thisExistingStatus.status


        this.log.info(`Starting watcher "${this.config.name || this.config.__name}"`)
        this.cron = new CronJob(this.config.interval, this.tick.bind(this), null, true, null, null, true /*tick immediately on itit*/)
        this.calculateNextRun()
    }

    stop(){
        if (!this.cron)
            return

        this.cron.stop()
    }

    calculateDisplayTimes(){
        const timespan = require('./timespan')

        this.timeInState = timespan(new Date(), this.enteredStatusTime)

        if (this.nextRun)
            this.next = timespan(this.nextRun, new Date())
    }


    calculateNextRun(){
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
        let history = require('./history'),
            testRun = '',
            exec = require('madscience-node-exec')

        this.lastRun = new Date()
        this.calculateNextRun()

        try {
            
            // if .cmd property set, run .cmd as a shell script
            if (this.config.cmd){
                testRun = this.config.cmd

                let thisConfigString = '',
                    result = await exec.sh({ cmd : `${this.config.cmd} ${thisConfigString}` })
                
                if (result.code === 0) {
                    this.status = 'up'
                    this.errorMessage = null
                } else {
                    const errorMessage = `${result.result} (code ${result.code})`
                    this.errorMessage = errorMessage
                    this.log.info(errorMessage)
                    this.status = 'down'
                }

            } else {

                // get test to run, if none is set, fall back to httpCheck as default
                let testname = this.config.test ? 
                        this.config.test 
                        : 'net.httpCheck', 
                    test = require(`../tests/${testname}`)
                
                testRun = testname

                // This is where the business of AWD? runs, this executes the test for a given watcher
                await test.run.call(this, this.config)

                // if reach here, no exception thrown, so test passed
                this.errorMessage = null
                this.status = 'up'
            }

        } catch(ex){

            // the watcher test failed, try to figure out how
            if (ex.type === 'awdtest.fail'){
                // Tests are expected to throw the 'awdtest.fail' error explicitly if whatever condition they test for isn't met, so we can 
                // treat this as an "expected" fail
                this.log.info(`Watcher "${this.config.__name}" test "${ex.test}" failed.`, ex.text)
                this.errorMessage = ex.text 
            } else {
                // oops, something unplanned happened.
                this.log.error(`Unhandled exception running "${testRun}"`, ex)
                this.errorMessage = `Unhandled exception:${ex.toString()}` 
            }

            this.status = 'down'
        }

        // write state of watcher to filesystem
        let status = null
        if (this.status === 'up')
            status = await history.writePassing(this.config.__safeName, this.lastRun)
        else if (this.status === 'down') 
            status = await history.writeFailing(this.config.__safeName, this.lastRun, this.errorMessage)

        // send alerts if status changed
        if (status.changed){
            this.enteredStatusTime = this.lastRun
            this.log.info(`Status changed, "${this.config.__name}" is ${this.status}.`)
            this.queueAlerts()
        }
    }


    /**
     * Writes alert information down to /queue directory. Alerts are periodically picked up by a daemon, collated into
     * a single message, and transmitted. 
     */
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
                    // receiver name does not have filesystem "safe" version, so write to disk as base64 string
                    const receiverNameBase64 = Buffer.from(recipientName).toString('base64'),
                        dir = path.join(settings.queue, transportName, receiverNameBase64)

                    await fs.ensureDir(dir)
                    await fs.writeJson(path.join(dir, this.config.__safeName), {
                        status : this.status
                    })

                    this.log.info(`queued alert to ${recipient[transportName]} via transport ${transportName} for process ${this.config.__name}. `)
                } catch (ex) {
                    this.log.error(`Error queuing alert to ${recipient[transportName]} via transport ${transportName} for process ${this.config.__name} : `, ex)
                }
            }
        }
    }
}