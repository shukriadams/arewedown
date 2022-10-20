module.exports =  {

    watchers : [],
    
    internalWorker: null,
    
    transportWorker: null,

    async start(){
        let Watcher = require('./watcher'),
            settings = require('./settings').get(),
            CronJob = require('cron').CronJob,
            offset = 0

        for (const watcherName in settings.watchers){
            const watcherConfig = settings.watchers[watcherName]

            watcherConfig.offset = offset
            offset += settings.watcherOffset

            const watcher = new Watcher(watcherConfig)
                
            this.watchers.push(watcher)
            watcher.start()
        }

        this.internalWorker = new CronJob(settings.internalWorkerTimer, this.internalWork, null, true, null, null, true /*runonitit*/)
        this.transportWorker = new CronJob(settings.transportWorkerTime, this.sendQueuedAlerts, null, true, null, null, true /*runonitit*/)
    },

    async stop(){
        this.internalWorker.stop()

        for (let watcher of this.watchers)
            watcher.stop()

        this.watchers = []
    },

    async sendQueuedAlerts(){
        const settings = require('./settings').get(),
            log = require('./logger').instance(),
            path = require('path'),
            fs = require('fs-extra'),
            fsUtils = require('madscience-fsUtils'),
            transportHandlers = require('./transports').getTransportHandlers()

        for (const transportName in settings.transports){
            const transportHandler = transportHandlers[transportName],
                transportQueuePath = path.join(settings.queue, transportName),
                receiversDirs = await fsUtils.getChildDirs(transportQueuePath)

            for(let receiverDir of receiversDirs){
                try {
                    const alertPaths = await fsUtils.readFilesInDir(receiverDir),
                        receiverName = Buffer.from(path.basename(receiverDir), 'base64').toString('ascii'),
                        summary = {
                            passing : [],
                            failing : []
                        }

                    for (let alertPath of alertPaths){
                        try {
                            const alert = await fs.readJson(alertPath),
                                watcherName = Buffer.from(path.basename(alertPath), 'base64').toString('ascii')

                            if (alert.isPassing)
                                summary.passing.push(watcherName)
                            else
                                summary.failing.push(watcherName)
                            
                        await fs.remove(alertPath)

                        } catch(ex){
                            log.error(`Unexpected error trying to read queued message ${alertPath} : `, ex)
                        }
                    }

                    const transportConfig = settings.recipients[receiverName][transportName]
                    if (summary.passing.length || summary.failing.length)
                        transportHandler.send(transportConfig, summary)

                } catch (ex){
                    log.error(`Unexpected error reading trying to read queued alerts for ${receiverDir} : `, ex)
                }
            }
        }
    },

    /**
     * AWD?'s own daemon process, used for house keeping.
     */
    async internalWork(){
        const settings = require('./settings').get(),
            log = require('./../lib/logger').instance(),
            timebelt = require('timebelt'),
            fsUtils = require('madscience-fsUtils'),
            fs = require('fs-extra'),
            path = require('path')

        try {

            // clean out all files created before settings.logRetention (days)
            if (settings.logRetention > 0) {
                const files = await fsUtils.readFilesUnderDir(settings.logs)
                for (let file of files){
                    const stat = await fs.stat(file)

                    if (path.basename(file) === 'status.json')
                        continue

                    if (timebelt.daysDifference(new Date(), stat.mtime) > settings.logRetention){
                        try {
                            await fs.remove(file)
                            log.info(`Removed file ${file}, age ${stat.mtime}`)
                        } catch(ex){
                            log.error(`failed to delete file ${file}`, ex)
                        }
                    }
                }
            }

        } catch (ex) {
            log.error(ex)
        } 
    }
}
