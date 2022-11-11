module.exports = express => {

    express.get('/watcher/:watcher', async (req, res) =>{

        const log = require('./../lib/logger').instance()

        try {
            const settings = require('./../lib/settings').get(),
                arrayHelper = require('./../lib/array'),
                watcher = settings.watchers[req.params.watcher],
                handlebarsLoader = require('madscience-handlebarsloader'),
                path = require('path'),
                fs = require('fs-extra'),
                view = await handlebarsLoader.getPage('watcher'),
                fsUtils = require('madscience-fsUtils'),
                timebelt = require('timebelt'),
                dashboardsWithWatcher = [],
                page = parseInt(req.query.page || '1') - 1

            if (!watcher){
                const view = await handlebarsLoader.getPage('invalidWatcher')
                res.status(404)
                return res.send(view({
                    title : req.params.watcher,
                    rootpath: settings.rootpath
                }))
            }
    
            let historyFolder = path.join(settings.logs, watcher.__safeName, 'history'),
                incidentCount = 0,
                startDate = null,
                lastIncidentDate = null,
                totalDownTime = 0,
                files = []

            if (await fs.exists(historyFolder))
                files = await fsUtils.readFilesUnderDirSync(historyFolder, false)

            // remove status.json as that doesn't contain historical data, then sort by filename (datetime) desc
            files = files
                .filter(file => file !== 'status.json' )
                .sort((a, b)=>
                    a > b ? -1:
                    b > a ? 1:
                        0)

            // files is filename strings, convert to objects containing both the filename, and the file content
            for(let i = 0 ; i < files.length ; i++){
                let file = files[i],
                    data 

                try {
                    data = await fs.readJson(path.join(historyFolder, file))
                } catch(ex){
                    log.error(`json file read error, likely corruption : ${ex}`)
                }
                

                if (data.status === 'down'){
                    incidentCount ++

                    if (!lastIncidentDate || data.date > lastIncidentDate)
                        lastIncidentDate = data.date
                }

                if (!startDate || data.date < startDate)
                    startDate = data.date

                files[i] = {
                    file,
                    data
                }
            }

            if (files.length){

                // calculate duration of each event relative to next in timeline. We use this to generate
                // 
                let deltaDate = new Date(),
                    longestDuration = 0,
                    shortestDuration = Number.MAX_VALUE

                for (const item of files){
                    const event = item.data
                    item.durationString = timebelt.timespanStringPlural(deltaDate, event.date)

                    if (item.data.status === 'down')
                        totalDownTime += timebelt.minutesDifference(deltaDate, event.date)

                    // +1 to ensure that log is always at least 0
                    // use log to flatten difference, making it easier to display wide ranges side-by-side
                    item.durationMinutes = Math.log(Math.abs(timebelt.minutesDifference(deltaDate, event.date)+1)) 

                    if (item.durationMinutes > longestDuration)
                        longestDuration = item.durationMinutes

                    if (item.durationMinutes < shortestDuration)
                        shortestDuration = item.durationMinutes


                    deltaDate = event.date
                }

                // add durationPercent to item data
                for (const item of files)
                    item.durationPercent = Math.floor(((item.durationMinutes - shortestDuration) * 100) / longestDuration) 

                // if there is only one item, force it have all duration
                if (files.length === 1)
                    files[0].durationPercent = 100
            }
            
            for (let dashboardName in settings.dashboards){
                const dashboard = settings.dashboards[dashboardName]
                if (dashboard.watchers.split(',').includes(watcher.__safeName))
                    dashboardsWithWatcher.push(dashboard)
            }

            res.send(view({
                title : `${settings.header} - ${watcher.name}`,
                dashboardsWithWatcher,
                incidentCount,
                lastIncidentDate,
                totalDownTime : timebelt.minutesToPeriodString(totalDownTime),
                watcherRuntime : startDate ? timebelt.timespanString(new Date(), startDate, ' days', ' hours', ' minutes', ' seconds') : null,
                page : arrayHelper.toPage(files, page, settings.pageSize),
                baseurl : `/watcher/${watcher.__safeName}?`,
                rootpath: settings.rootpath
            }))

        } catch(ex) {
            res.status(500)
            res.end('Something went wrong - check logs for details.')
            log.error(ex)
        }
    })
}