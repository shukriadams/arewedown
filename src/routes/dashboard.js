module.exports = express => {

    /**
     * Renders a dashboard. Does not autoreload, autoreload must be called via the default url /
     * The autoreload frame will in turn call and autorefresh this dashboard view.
     */
    express.get('/dashboard/:dashboard?', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            let settings = require('./../lib/settings').get(),
                handlebarsLoader = require('madscience-handlebarsloader'),
                arrayHelper = require('./../lib/array'),
                daemon = require('./../lib/daemon'),
                history = require('./../lib/history'),
                timespan = require('./../lib/timespan'),
                dashboardNode = req.params.dashboard || Object.keys(settings.dashboards)[0],
                now = new Date(),
                hasErrors = false,
                view = await handlebarsLoader.getPage('dashboard'),
                dashboard = settings.dashboards[dashboardNode]

            if (!dashboard){
                view = await handlebarsLoader.getPage('invalidDashboard')
                res.status(404)

                return res.send(view({
                    title : dashboardNode,
                    hasErrors : true
                }))
            }

            const dashboardWatchers = arrayHelper.split(dashboard.watchers, ','), // clone array, we don't want to change source
                // get cronprocesses that are running and used on the current dashboard
                watchers = daemon.watchers.filter(watcher => dashboardWatchers.includes(watcher.config.__name) )

            hasErrors = watchers.filter(watcher => !watcher.isPassing).length > 0

            watchers.sort((a,b)=> a.isPassing - b.isPassing || a.config.name.localeCompare(b.config.name))

            for (let watcher of watchers){
                const watcherLastEvent = await history.getLastEvent(watcher.config.__safeName) 
                watcher.state = watcher.isPassing ? 'Up' : 'Down'
                if (watcherLastEvent)
                    watcher.timeInState = timespan(new Date(), watcherLastEvent.date)

                if (watcher.nextRun)
                    watcher.next = timespan(watcher.nextRun, new Date())
            }
            
            res.send(view({
                title : `${settings.header} ${dashboard.name}`,
                dashboardNode,
                dashboardRefreshInterval : settings.dashboardRefreshInterval,
                hasErrors,
                renderDate : `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                watchers,
                dashboards : Object.keys(settings.dashboards).length > 1 ? settings.dashboards : null
            }))
            
        } catch (ex){
            log.error(ex)
            res.status(500)
            res.end('Something went wrong - check logs for details.')
        }
    })
}