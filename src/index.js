const 
    http = require('http'),
    Express = require('express'),
    app = Express(),
    jsonfile = require('jsonfile'),
    settingsFile = './settings.json',
    daemon = require('./lib/daemon');

(async function(){
    if (!fs.existsSync(settingsFile))
        return console.log('settings.json not found');

    const settings = jsonfile.readFileSync(settingsFile);
    const port = settings.port || 3000;
    const failCode = settings.failCode || 450;

    if (!settings.port)
        console.log('Port not defined in settings, falling back to default');

    daemon.start(settings);

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

        if (passed) {
            result += 'PASSED'

        } else {
            result = `ONE ORE MORE JOBS FAILED <br/> ${result}`;
            result += 'ONE ORE MORE JOBS FAILED'
            res.status(failCode);
        }

        res.send(result);
    });

    const server = http.createServer(app);
    server.listen(port);

    console.log(`Listening on port ${port}`);
})()
