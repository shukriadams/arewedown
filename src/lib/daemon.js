const path = require('path'),
    fs = require('fs-extra'),
    fsUtils = require('madscience-fsUtils'),
    timebelt = require('timebelt'),
    log = require('./../lib/logger').instance(),
    settings = require('./settings')

module.exports =  {

    watchers : [],
    
    internalWorker: null,

    async start(){
        const Watcher = require('./watcher'),
            CronJob = require('cron').CronJob

        for (const watcherName in settings.watchers){
            const watcherConfig = settings.watchers[watcherName]
            if (watcherConfig.enabled){
                const watcher = new Watcher(watcherConfig)
                this.watchers.push(watcher)
                watcher.start()
            } else {
                log.info(`Skipping disabled watcher "${watcher.__name}"${watcher.error ? ` ${watcher.error}`:''}`)
            }
        }

        this.internalWorker = new CronJob(settings.internalWorkerTimer, this.internalWork, null, true, null, null, true /*runonitit*/)
    },

    async internalWork(){
        try {
            if (settings.logRetention > 0) {
                const files = await fsUtils.readFilesUnderDir(settings.logs)
                for (const file of files){
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
