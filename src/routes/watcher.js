module.exports = express => {

    express.get('/watcher/:watcher', async (req, res) =>{

        const log = require('./../lib/logger').instance()

        try {
            const settings = require('./../lib/settings').get(),
                watcher = settings.watchers[req.params.watcher],
                handlebarsLoader = require('madscience-handlebarsloader'),
                path = require('path'),
                fs = require('fs-extra'),
                fsUtils = require('madscience-fsUtils'),
                timebelt = require('timebelt')
        
            if (!watcher){
                const view = await handlebarsLoader.getPage('invalidWatcher')
                res.status(404)
                return res.send(view({
                    title : req.params.watcher
                }))
            }
    
            let index = parseInt(req.query.index) || 0,
                pagesize = parseInt(req.query.pagesize) || 50,
                historyFolder = path.join(settings.logs, watcher.__safeName, 'history'),
                files = [],
                history = []

            if (await fs.exists(historyFolder))
                files = await fsUtils.readFilesUnderDirSync(historyFolder, false)

            files = files.filter((file)=>{ return file != 'status.json' })
            files = files.slice(index, pagesize)
            files = files.sort()

            for(const file of files){
                let data = await fs.readJson(path.join(historyFolder, file))
                history.push(data)
            }
            
            history = history.sort((a, b)=>{
                return a.date > b.date? 1 :
                    b.date > a.date? -1:
                    0
            })

            if (history.length){

                // calculate duration of each event relative to next in timeline
                let deltaDate = new Date(),
                    longestDuration = 0,
                    shortestDuration = Number.MAX_VALUE

                for (const event of history){
                    event.durationString = timebelt.timespanString( event.date, deltaDate, ' day(s)', ' hour(s)', ' minute(s)', ' second(s)')
                    event.durationMinutes = Math.log(timebelt.minutesDifference(event.date, deltaDate))

                    if (event.durationMinutes > longestDuration)
                        longestDuration = event.durationMinutes

                    if (event.durationMinutes < shortestDuration)
                        shortestDuration = event.durationMinutes

                    deltaDate = event.date
                }

                for (const event of history)
                    event.durationPercent = Math.floor(((event.durationMinutes - shortestDuration) * 100) / longestDuration) 

            }
            
            const view = await handlebarsLoader.getPage('watcher')
            res.send(view({
                title : `${settings.header} : ${watcher.name} history`,
                history
            }))

        } catch(ex) {
            res.status(500)
            res.end('Something went wrong - check logs for details.')
            log.error(ex)
        }
    })
}