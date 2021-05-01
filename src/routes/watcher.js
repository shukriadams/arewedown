const handlebars = require('./../lib/handlebars'),
    path = require('path'),
    fs = require('fs-extra'),
    jsonfile= require('jsonfile'),
    fsUtils = require('madscience-fsUtils'),
    log = require('./../lib/logger').instance(),
    timebelt = require('timebelt'),
    settings = require('./../lib/settings')

module.exports = function(app){
    app.get('/watcher/:watcher', async function(req, res){
        try {
            const watcher = settings.watchers[req.params.watcher]
            if (!watcher){
                const view = handlebars.getView('invalidWatcher')
                return res.send(view({
                    title : req.params.watcher
                }))
            }
    
            const index = parseInt(req.query.index) || 0,
                pagesize = parseInt(req.query.pagesize) || 50,
                historyFolder = path.join(settings.logs, watcher.__safeName, 'history')

            if (!await fs.exists(historyFolder))
                throw `Expected history folder "${historyFolder}" not found.`

            let history = [],
                files = await fsUtils.readFilesUnderDirSync(historyFolder, false)

            files = files.filter((file)=>{ return file != 'status.json' })
            files = files.slice(index, pagesize)
            files = files.sort()

            for(const file of files){
                let data = await jsonfile.readFile(path.join(historyFolder, file))
                history.push(data)
            }
            
            history = history.sort((a, b)=>{
                return a.date > b.date? -1 :
                    b.date > a.date? 1:
                    0
            })

            if (history.length){
                let deltaDate = new Date()
                for (const historyItem of history){
                    historyItem.duration = timebelt.timespanString(deltaDate, historyItem.date, ' day(s)', ' hour(s)', ' minute(s)', ' second(s)')
                    historyItem.durationPercent = timebelt.minutesDifference(deltaDate, historyItem.date)
                    if (historyItem.durationPercent == 0)
                        historyItem.durationPercent = 1
                    if (historyItem.durationPercent > 500)
                        historyItem.durationPercent = 500

                    deltaDate = historyItem.date
                }
            }
            
            let view = handlebars.getView('watcher')
            res.send(view({
                title : `${watcher.name} history`,
                history
            }))

        } catch(ex) {
            res.status(500)
            res.end('Something went wrong - check logs for details.')
            log.error(ex)
        }
    })
}