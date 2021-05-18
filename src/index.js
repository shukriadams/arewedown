(async ()=>{
    const startArgs = require('./lib/startArgs').get(),
        process = require('process'),
        fs = require('fs-extra')

    if (startArgs.version){
        const package = await fs.readJson(`${__dirname}/package.json`)
        console.log(`AreWeDown? v${package.version}`)
        return process.exit(0)
    }

    let server,
        daemon = require('./lib/daemon'),
        http = require('http'),
        Express = require('express'),
        express = Express(),
        path = require('path'),
        settings = require('./lib/settings'),
        smtp = require('./lib/smtp'),
        sh = require('madscience-node-exec').sh,
        routeFiles = fs.readdirSync(path.join(__dirname, 'routes'))

    
    // Execute onstart shell command - this is intended for docker builds where the user wants to 
    // install app or set state in the container, but doesn't want to bake their own container image
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


    await fs.ensureDir(settings.logs)

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