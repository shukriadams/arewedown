const 
    http = require('http'),
    Express = require('express'),
    app = Express(),
    settings = require('./lib/settings') ,
    Logger = require('winston-wrapper'),
    daemon = require('./lib/daemon'),
    fs = require('fs-extra'),
    path = require('path'),
    routeFiles = fs.readdirSync(path.join(__dirname, 'routes'));

(async function(){

    // static content
    app.use(Express.static('./public'));

    // load routes
    for (let routeFile of routeFiles){
        const name = routeFile.match(/(.*).js/).pop(),
            routes = require(`./routes/${name}`);

        routes(app);
    }

    Logger.initialize(settings.logPath);
    daemon.start();
    
    const server = http.createServer(app);
    server.listen(settings.port);

    console.log(`Listening on port ${settings.port}`);
})()
