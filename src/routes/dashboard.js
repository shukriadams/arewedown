const fs = require('fs-extra'),
    path = require('path'),
    settings = require('./../lib/settings').get(),
    jsonfile = require('jsonfile'),
    handlebars = require('./../lib/handlebars'),
    arrayHelper = require('./../lib/array'),
    daemon = require('./../lib/daemon');

module.exports = function(app){

    /**
     * Renders a dashboard. Does not autoreload, autoreload must be called via the default url /
     * The autoreload frame will in turn call and autorefresh this dashboard view.
     */
    app.get('/dashboard/:dashboard?', async function(req, res){
        const dashboardNode = req.params.dashboard;

        if (!settings.dashboards || !Object.keys(settings.dashboards).length){
            let view = handlebars.getView('noDashboards');
            return res.send(view());
        }

        let dashboard = settings.dashboards[dashboardNode];
        if (!dashboard){
            let view = handlebars.getView('invalidDashboard');
            return res.send(view({
                title : dashboardNode
            }));
        }

        let title = dashboard.name;
        let view = handlebars.getView('dashboard');

        // clone array, we don't want to change source
        let dashboardWatchers = arrayHelper.split(dashboard.watchers, ',');
        let cronJobs = daemon.cronJobs.slice(0).filter((job)=>{
            if (!job.config.enabled)
                return null;

            if (!dashboardWatchers.includes(job.config.__name))
                return null;

            return job;
        }); 

        const allJobsPassed = cronJobs.filter((job)=>{
            return job.isPassing || job.config.enabled === false ? null : job;
        }).length === 0;

        cronJobs.sort((a,b)=>{
            return a.isPassing - b.isPassing || a.config.name.localeCompare(b.config.name)
        });

        for (let cronJob of cronJobs){
            const statusFilePath = path.join(__dirname, settings.logs, cronJob.config.__safeName, 'status.json');
            
            cronJob.status = 'unknown'
            cronJob.statusDate = null;

            if (!await fs.pathExists(statusFilePath))
                continue;

            const status = jsonfile.readFileSync(statusFilePath);
            cronJob.status = status.status;
            cronJob.statusDate = new Date(status.date);

            if (cronJob.nextRun){
                cronJob.next = Math.floor((cronJob.nextRun.getTime() - new Date().getTime()) / 1000) + 's'; 
            }
        }

        const now = new Date();

        res.send(view({
            title,
            dashboardNode,
            dashboardRefreshInterval : settings.dashboardRefreshInterval,
            allJobsPassed,
            renderDate: `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`,
            jobs : cronJobs
        }));
    });
}