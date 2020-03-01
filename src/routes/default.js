
const settings = require('./../lib/settings').get(),
    fs = require('fs-extra'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    handlebars = require('./../lib/handlebars');
    arrayHelper = require('./../lib/array'),
    NO_DASHBOARDS_FLAG = '__no_dashboards_defined',
    daemon = require('./../lib/daemon');

module.exports = function(app){
        
    app.get('/:dashboard?', async function(req, res){
        let dashboardNode = req.params.dashboard;
        if (!dashboardNode && settings.dashboards){
            // fall back to first dashboard
            let definedDashboardKeys = Object.keys(settings.dashboards);
            dashboardNode = definedDashboardKeys.length ? definedDashboardKeys[0]: dashboardNode;
        }

        if (!dashboardNode)
            dashboard = NO_DASHBOARDS_FLAG;

        let view = handlebars.getView('default');
        res.send(view({
            title : 'Are we down?',
            dashboardNode,
            dashboardRefreshInterval : settings.dashboardRefreshInterval,
        }));
    });

    
    /**
     * Internal url called by autorefresh default view
     */
    app.get('/dashboard/:dashboard', async function(req, res){
        const dashboardNode = req.params.dashboard;

        if (dashboardNode === NO_DASHBOARDS_FLAG){
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
            const statusFilePath = path.join(__dirname, './../flags', `${cronJob.config.__safeName}_history` , 'status.json');
            
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

    
    /**
     * Returns a count of failing jobs. Returns 0 if all jobs are passing.
     */
    app.get('/failing', async function(req, res){
        let cronJobs = daemon.cronJobs.slice(0); // clone array, we don't want to change source

        const failingJobs = cronJobs.filter((job)=>{
            return job.isPassing || job.config.enabled === false ? null : job;
        });

        res.send(failingJobs.length.toString());
    });


    app.get('/isalive', function(req, res){
        res.send('ARE WE DOWN? service is running');
    });
}