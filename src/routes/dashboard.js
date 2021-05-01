const fs = require('fs-extra'),
    path = require('path'),
    settings = require('./../lib/settings'),
    jsonfile = require('jsonfile'),
    handlebars = require('./../lib/handlebars'),
    arrayHelper = require('./../lib/array'),
    daemon = require('./../lib/daemon')

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
        let cc = daemon.getCronJobs()
        let cronJobs = cc.slice(0).filter((job)=>{
            if (!job.config.enabled)
                return null

            if (!dashboardWatchers.includes(job.config.__name))
                return null

            return job
        })

        hasErrors = cronJobs.filter((job)=>{
            return job.isPassing || !job.config.enabled ? 
                null : 
                job
        }).length > 0

        cronJobs.sort((a,b)=>{
            return a.isPassing - b.isPassing || a.config.name.localeCompare(b.config.name)
        })

        for (let cronJob of cronJobs){
            const statusFilePath = path.join(__dirname, settings.logs, cronJob.config.__safeName, 'status.json')
            
            cronJob.status = 'unknown'
            cronJob.statusDate = null

            if (!await fs.pathExists(statusFilePath))
                continue

            const status = jsonfile.readFileSync(statusFilePath)
            cronJob.status = status.status
            cronJob.statusDate = new Date(status.date)

            if (cronJob.nextRun)
                cronJob.next = Math.floor((cronJob.nextRun.getTime() - new Date().getTime()) / 1000) + 's' 
        }

        const now = new Date()

        res.send(view({
            title,
            dashboardNode,
            debug: settings.debug,
            dashboardRefreshInterval : settings.dashboardRefreshInterval,
            hasErrors,
            renderDate: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
            jobs : cronJobs
        }))
    })
}