module.exports =  {

    watchers : [],
    
    internalWorker: null,

    async start(){
        const Watcher = require('./watcher'),
            settings = require('./settings').get(),
            CronJob = require('cron').CronJob

        for (const watcherName in settings.watchers){
            const watcherConfig = settings.watchers[watcherName],
                watcher = new Watcher(watcherConfig)
                
            this.watchers.push(watcher)
            watcher.start()
        }

        this.internalWorker = new CronJob(settings.internalWorkerTimer, this.internalWork, null, true, null, null, true /*runonitit*/)
    },

    async internalWork(){
        const settings = require('./settings').get(),
            log = require('./../lib/logger').instance()
            timebelt = require('timebelt'),
            fsUtils = require('madscience-fsUtils'),
            fs = require('fs-extra'),
            path = require('path')

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
