
const settings = require('./../lib/settings'),
    fs = require('fs-extra'),
    path = require('path'),
    jsonfile = require('jsonfile'),
    handlebars = require('./../lib/handlebars');
    daemon = require('./../lib/daemon');

module.exports = function(app){
    
    app.get('/', async function(req, res){
        let view = handlebars.getView('default');
        let allJobsPassed = daemon.cronJobs.filter((job)=>{
            return job.isPassing ? null : job;
        }).length === 0;

        for (let cronJob of daemon.cronJobs){
            const statusFilePath = path.join(__dirname, './../flags', `${cronJob.name}_history` , 'status.json');
            
            cronJob.status = 'unknown'
            cronJob.statusDate = null;

            if (!await fs.pathExists(statusFilePath))
                continue;

            const status = jsonfile.readFileSync(statusFilePath);
            cronJob.status = status.status;
            cronJob.statusDate = new Date(status.date);
        }

        return res.send(view({
            clientRefreshInterval : settings.clientRefreshInterval,
            allJobsPassed,
            jobs : daemon.cronJobs
        }));

        let passed = true,
            result = '';

        for(let job of daemon.cronJobs){
            
            result += `${job.name} last ran ${job.lastRun}`;

            if (job.isPassing){
                result += ' passed '
            } else {
                passed = false;
                result += ' failed '
            }

            result += '<br />'
        }

        if (passed) 
        {
            result += 'PASSED'
        } 
        else 
        {
            result = `ONE OR MORE JOBS FAILED <br /> ${result} <br /> ONE OR MORE JOBS FAILED`;
            res.status(settings.partialFailCode);
        }

        res.send(result);
    });

    app.get('/status', function(req, res){
        res.send('AM I Down service running');
    });
}