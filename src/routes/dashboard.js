const settings = require('./../lib/settings'),
    handlebarsLoader = require('madscience-handlebarsloader')
    arrayHelper = require('./../lib/array'),
    daemon = require('./../lib/daemon'),
    timespan = require('./../lib/timespan')

module.exports = app => {

    /**
     * Renders a dashboard. Does not autoreload, autoreload must be called via the default url /
     * The autoreload frame will in turn call and autorefresh this dashboard view.
     */
    app.get('/dashboard/:dashboard?', async function(req, res){
        let dashboardNode = req.params.dashboard,
            now = new Date(),
            hasErrors = false

        if (!settings.dashboards || !Object.keys(settings.dashboards).length){
            let view = await handlebarsLoader.getPage('noDashboards')
            return res.send(view({
                hasErrors
            }))
        }

        let dashboard = settings.dashboards[dashboardNode]
        if (!dashboard){
            let view = await handlebarsLoader.getPage('invalidDashboard')
            return res.send(view({
                title : dashboardNode,
                hasErrors : true
            }))
        }

        const view = await handlebarsLoader.getPage('dashboardInner'),
            dashboardWatchers = arrayHelper.split(dashboard.watchers, ','), // clone array, we don't want to change source
            // get cronprocesses that are running and used on the current dashboard
            watchers = daemon.watchers.slice(0).filter((job)=>{
                if (!dashboardWatchers.includes(job.config.__name))
                    return null

                return job
            })

        hasErrors = watchers.filter((job)=>{
            return !job.isPassing
        }).length > 0

        watchers.sort((a,b)=>{
            return a.isPassing - b.isPassing || a.config.name.localeCompare(b.config.name)
        })

        for (let watcher of watchers)
            if (watcher.nextRun)
                watcher.next = timespan(watcher.nextRun, new Date())
        

        res.send(view({
            title : `${settings.header} ${dashboard.name}`,
            dashboardNode,
            dashboardRefreshInterval : settings.dashboardRefreshInterval,
            hasErrors,
            renderDate: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
            watchers 
        }))
    })
}