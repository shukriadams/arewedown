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
            await watcher.start()
        }

        this.internalWorker = new CronJob(settings.internalWorkerTimer, this.internalWork.bind(this), null, true, null, null, true /*runonitit*/)
        this.transportWorker = new CronJob(settings.transportWorkerTime, this.sendQueuedAlerts.bind(this), null, true, null, null, true /*runonitit*/)
    },

    async stop(){
        this.internalWorker.stop()

        for (let watcher of this.watchers)
            watcher.stop()

        this.watchers = []
    },


    /**
     * 
     */
    async sendQueuedAlerts(){
        const settings = require('./settings').get(),
            log = require('./logger').instance(),
            path = require('path'),
            crypto = require('crypto'),
            fs = require('fs-extra'),
            fsUtils = require('madscience-fsUtils'),
            transportHandlers = require('./transports').getTransportHandlers(),
            actualPassingCount = this.watchers.filter(w => w.status === 'up').length,
            actualFailingCount = this.watchers.filter(w => w.status === 'down').length

        for (const transportName in settings.transports){
            const transportHandler = transportHandlers[transportName],
                transportQueuePath = path.join(settings.queue, transportName),
                receiversDirs = await fsUtils.getChildDirs(transportQueuePath)

            for(let receiverDir of receiversDirs){
                try {
                    let alertPaths = await fsUtils.readFilesInDir(receiverDir),
                        receiverName = Buffer.from(path.basename(receiverDir), 'base64').toString('ascii'),
                        delta = {
                            // names of passing alerts based on queued alerts, this can be out of sync with actual passing
                            passing : [],
                            // names of failing alerts based on queued alerts, this can be out of sync with actual failing
                            failing : [],
                            actualPassingCount,
                            actualFailingCount
                        }
                        
                    // ignore lastMessageHash.txt 
                    alertPaths = alertPaths.filter(a => !a.endsWith('.txt'))

                    if (!alertPaths.length)
                        continue

                    for (let alertPath of alertPaths){
                        try {
                                
                            const alert = await fs.readJson(alertPath),
                                watcherSafeName = path.basename(alertPath)

                            if (alert.status === 'up')
                                delta.passing.push(watcherSafeName)
                            else if (alert.status === 'down')
                                delta.failing.push(watcherSafeName)
                            
                            await fs.remove(alertPath)

                        } catch(ex){
                            log.error(`Unexpected error trying to read queued message ${alertPath} : `, ex)
                            // queued message is likely corrupt, force delete it
                            try {
                                await fs.remove(alertPath)
                                log.warn(`deleted suspected corrupt queue file ${alertPath}`)
                            } catch (ex){
                                log.error(`failed to delete suspected corrupt queue file ${alertPath} : ${ex}`)
                            }
                        }
                    }

                    const transportConfig = settings.recipients[receiverName] ? settings.recipients[receiverName][transportName] : null,
                        text = this.generateContent(delta),
                        textHash = crypto.createHash('md5').update(text).digest('hex'),
                        receiverLastMessageLog = path.join(receiverDir, 'lastMessageHash.txt')
            
                    // if user already received this message, skip 
                    if (await fs.exists(receiverLastMessageLog) ){
                        const lookup =  await fs.readFile(receiverLastMessageLog, 'utf-8')
                        if (lookup === textHash)
                            continue
                    }           

                    // write hash of text message as last sent message, we use this to prevent oversending
                    await fs.outputFile(receiverLastMessageLog, textHash)

                    if (transportConfig)
                        transportHandler.send(transportConfig, delta, text)

                } catch (ex){
                    log.error(`Unexpected error reading trying to read queued alerts for ${receiverDir} : `, ex)
                }
            }
        }
    },


    generateContent(delta){
        let message = ''

        if (!delta.actualPassingCount && !delta.actualFailingCount)
            return 'No watchers running - nothing to report'

        if (!delta.actualFailingCount)
            message += `SUCCESS : All watchers are up. `

        if (delta.actualFailingCount)
            message += `WARNING : ${delta.actualFailingCount} watcher${this.plural(delta.actualFailingCount,'','s')} ${this.plural(delta.actualFailingCount)} down. `

        if (delta.failing.length)    
            message += `Latest fail${this.plural(delta.failing,'','s')} ${this.plural(delta.failing)} ${delta.failing.join(', ')}. `

        if (delta.passing.length)
            message += `${delta.passing.join(', ')} ${this.plural(delta.passing)} up again. `

        return message
    },

    plural(count, single = 'is', plural='are'){
        let cnt = count
        if (Array.isArray(count))
            cnt = count.length

        return cnt === 1 ? single : plural
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
