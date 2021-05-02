const settings = require('./../lib/settings'),
    handlebars = require('./../lib/handlebars'),
    arrayHelper = require('./../lib/array'),
    daemon = require('./../lib/daemon')

const timespanString = function(end, start){
    if (typeof start === 'number' || typeof start === 'string')
        start = new Date(start)

    if (typeof end === 'number' || typeof end === 'string')
        end = new Date(end)

    let diff = end.getTime() - start.getTime()
    if (diff <= 0)
        return 'now'

    let days = Math.floor(diff / (1000 * 60 * 60 * 24))
    diff -=  days * (1000 * 60 * 60 * 24)

    let hours = Math.floor(diff / (1000 * 60 * 60))
    diff -= hours * (1000 * 60 * 60)

    let mins = Math.floor(diff / (1000 * 60))
    let secs = Math.floor(diff / 1000)
    function plural(value){
        return value > 1 ?'s':''
    }

    if (days >= 1)
        return `${days} day${plural(days)}`

    if (hours >= 1)
        return `${hours} hour${plural(hours)}}`
    
    if (mins >= 1)
        return `${mins} minute${plural(mins)}`
    
    return `${secs} second${plural(secs)}`
}

module.exports = app => {

    /**
     * Renders a dashboard. Does not autoreload, autoreload must be called via the default url /
     * The autoreload frame will in turn call and autorefresh this dashboard view.
     */
    app.get('/dashboard/:dashboard?', async function(req, res){
        let dashboardNode = req.params.dashboard,
            hasErrors = false

        if (!settings.dashboards || !Object.keys(settings.dashboards).length){
            let view = handlebars.getView('noDashboards')
            return res.send(view({
                hasErrors
            }))
        }

        let dashboard = settings.dashboards[dashboardNode]
        if (!dashboard){
            let view = handlebars.getView('invalidDashboard')
            return res.send(view({
                title : dashboardNode,
                hasErrors : true
            }))
        }

        let title = dashboard.name,
            view = handlebars.getView('dashboardInner'),
            dashboardWatchers = arrayHelper.split(dashboard.watchers, ',') // clone array, we don't want to change source

        // get cronprocesses that are running and used on the current dashboard
        let watchers = daemon.getWatchers().slice(0).filter((job)=>{
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

        for (let watcher of watchers){
            if (watcher.nextRun)
                watcher.next = timespanString(watcher.nextRun, new Date())
        }

        const now = new Date()

        res.send(view({
            title,
            dashboardNode,
            dashboardRefreshInterval : settings.dashboardRefreshInterval,
            hasErrors,
            renderDate: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
            watchers 
        }))
    })
}