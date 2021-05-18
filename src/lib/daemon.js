let CronJob = require('cron').CronJob,
    path = require('path'),
    Watcher = require('./watcher'),
    fs = require('fs-extra'),
    fsUtils = require('madscience-fsUtils'),
    timebelt = require('timebelt'),
    log = require('./../lib/logger').instance(),
    settings = require('./settings'),
    daemon = {

        watchers : [],
        
        internalWorker: null,

        getWatchers(){
            return this.watchers
        },

        async start(){
            
            this.watchers = []

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

            this.internalWorker = new CronJob(settings.internalWorkerTimer, async()=>{
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
                } catch (ex){
                    log.error(ex)
                } 
            }, null, true, null, null, true /*runonitit*/)

            if (!settings.watchers || !Object.keys(settings.watchers).length)
                log.warn('No watchers were defined in settings file')
        },

        async stop(){
            this.internalWorker.stop()
            for (const watcher of this.watchers)
                watcher.stop()
        }
    }

module.exports = daemon
