
const settings = require('./../lib/settings'),
    fs = require('fs-extra'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    handlebars = require('./../lib/handlebars');
    daemon = require('./../lib/daemon');

module.exports = function(app){
    
        
    app.get('/', async function(req, res){
        let view = handlebars.getView('default');
        res.send(view({
            clientRefreshInterval : settings.clientRefreshInterval,
        }));
    });

    app.get('/status', async function(req, res){
        let view = handlebars.getView('status'),
            cronJobs = daemon.cronJobs.slice(0); // clone array, we don't want to change source

        const allJobsPassed = cronJobs.filter((job)=>{
            return job.isPassing ? null : job;
        }).length === 0;

        cronJobs.sort((a,b)=>{
            return a.isPassing - b.isPassing || a.name.localeCompare(b.name)
            /*
            return a.isPassing? 1 :
                b.isPassing? -1 :
                0;
            */
        });

        for (let cronJob of cronJobs){
            const statusFilePath = path.join(__dirname, './../flags', `${cronJob.name}_history` , 'status.json');
            
            cronJob.status = 'unknown'
            cronJob.statusDate = null;

            if (!await fs.pathExists(statusFilePath))
                continue;

            const status = jsonfile.readFileSync(statusFilePath);
            cronJob.status = status.status;
            cronJob.statusDate = new Date(status.date);
            if (cronJob.nextRun){
                //console.log(cronJob.nextRun.getTime());
                cronJob.next = Math.floor((cronJob.nextRun.getTime() - new Date().getTime()) / 1000) + 's'; 
            }
        }

        res.send(view({
            clientRefreshInterval : settings.clientRefreshInterval,
            allJobsPassed,
            renderDate: new Date(),
            jobs : cronJobs
        }));
    });


    app.get('/isalive', function(req, res){
        res.send('ARE WE DOWN? service is running');
    });
}