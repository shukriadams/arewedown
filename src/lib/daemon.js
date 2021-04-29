let CronJob = require('cron').CronJob,
    path = require('path'),
    CronProcess = require('./CronProcess'),
    fs = require('fs-extra'),
    fsUtils = require('madscience-fsUtils'),
    timebelt = require('timebelt'),
    log = require('./../lib/logger').instance(),
    settings = require('./settings'),
    daemon = {

        cronJobs : [],
        
        internalWorker: null,

        getCronJobs(){
            return this.cronJobs
        },

        async start(){
            
            this.cronJobs = []

            for (const watcherName in settings.watchers){
                const watcher = settings.watchers[watcherName]
                if (watcher.enabled){
                    const cronProcess = new CronProcess(watcher)
                    this.cronJobs.push(cronProcess)
                    cronProcess.start()
                } else {
                    console.log(`Skipping disabled watcher "${watcher.__name}"${watcher.error ? ` ${watcher.error}`:''}`)
                }
            }

            this.internalWorker = new CronJob(settings.internalWorkerTimer, async()=>{
                try
                {
                    let files = await fsUtils.readFilesUnderDir(settings.logs)
                    for (const file of files){
                        const stat = await fs.stat(file)
                        if (path.basename(file) === 'status.json')
                            continue

                        if (timebelt.daysDifference(new Date(), stat.mtime) > settings.logRetention){
                            try {
                                await fs.remove(file)
                                log.info.info(`Removed file ${file}, age ${stat.mtime}`)
                            } catch(ex){
                                log.error.error(`failed to delete file ${file}`, ex)
                            }
                        }
                    }
                } catch (ex){
                    log.error.error(ex)
                } 
            }, null, true, null, null, true /*runonitit*/)

            if (!settings.watchers || !Object.keys(settings.watchers).length)
                console.warn('No watchers were defined in settings file')
        },

        async stop(){
            this.internalWorker.stop()
            for (const job of this.cronJobs)
                job.stop()
        }
    }

module.exports = daemon
