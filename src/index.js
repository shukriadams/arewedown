const 
    http = require('http'),
    Express = require('express'),
    app = Express(),
    settings = require('./lib/settings') ,
    Logger = require('winston-wrapper'),
    daemon = require('./lib/daemon');

(async function(){
    Logger.initialize(settings.logPath);
    daemon.start();

    app.get('/status', function(req, res){

        let passed = true;
        let result = '';

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
        } else {
            result = `ONE OR MORE JOBS FAILED <br /> ${result} <br /> ONE OR MORE JOBS FAILED`;
            res.status(settings.failCode);
        }

        res.send(result);
    });

    const server = http.createServer(app);
    server.listen(settings.port);

    console.log(`Listening on port ${settings.port}`);
})()
