(async ()=>{

    let server,
        daemon = require('./lib/daemon')
        http = require('http'),
        Express = require('express'),
        express = Express(),
        process = require('process'),
        fs = require('fs-extra'),
        path = require('path'),
        settings = require('./lib/settings'),
        smtp = require('./lib/smtp'),
        sh = require('madscience-node-exec').sh,
        routeFiles = fs.readdirSync(path.join(__dirname, 'routes'))

    await fs.ensureDir(settings.logs)
    
    if (settings.onstart){
        console.log('onstart command executing')

        try {
            const result = await sh({  cmd : settings.onstart })
            console.log(`onstart finished with result`, result)
        } catch(ex){
            console.log(`onstart failed with`, ex)
            process.exit(1)
        }
    }

    // static content
    express.use(Express.static('./public'))
    express.get('/restart', async (req, res)=>{
        if (!settings.allowHttpRestart){
            res.status(403)
            res.end('Not allowed. set "allowHttpRestart:true" to enable restart')
            return
        }

        console.log(`Application shutting down normally`)
        process.exit(1)
        
        res.end('restart request')
    })

    // load routes
    for (const routeFile of routeFiles){
        const name = routeFile.match(/(.*).js/).pop(),
            routes = require(`./routes/${name}`)

        routes(express)
    }
    
    if(settings.transports.smtp)
        await smtp.ensureSettingsOrExit()

    await daemon.start()
    
    server = http.createServer(express)
    serverProcess = server.listen(settings.port)
    console.log(`Listening on port ${settings.port}`)

})()