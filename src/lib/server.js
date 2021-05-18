

module.exports = {

    /**
     * Starts the AreWedown? Server. 
     */
    async start(){

        let server,
            fs = require('fs-extra'),
            daemon = require('./daemon'),
            http = require('http'),
            Express = require('express'),
            express = Express(),
            path = require('path'),
            settings = require('./settings'),
            sh = require('madscience-node-exec').sh,
            routeFiles = fs.readdirSync(path.join(__dirname, '/../routes'))
   
        
        // Execute onstart shell command - this is intended for docker builds where the user wants to 
        // install app or set state in the container, but doesn't want to bake their own container image.
        // This state is ephemeral, so this solution isn't optimal, but it at least docker novices a chance
        // to run shell commands with advanced requirements. Options are nice.
        if (settings.onstart){
            console.log('onstart command executing')
    
            try {
                const result = await sh({ cmd : settings.onstart })
                console.log(`onstart finished with result : `, result)
            } catch(ex){
                throw { text : `onstart failed with error : `, ex }
            }
        }
    
        await fs.ensureDir(settings.logs)


        // validate active transport's settings by attempting to contact provider 
        for (const transportName in settings.transports){
            if (!settings.transports[transportName].enabled)
                continue

            const transport = require(`./${transportName}`)
            if (!transport.ensureSettingsOrExit)
                throw `transport method "${transportName}" missing expected method "ensureSettingsOrExit"`

            await transport.ensureSettingsOrExit()
        }
        

        // load routes
        for (const routeFile of routeFiles){
            const routeFileName = routeFile.match(/(.*).js/).pop(),
                route = require(`./../routes/${routeFileName}`)
    
            route(express)
        }
        
        await daemon.start()
        
        server = http.createServer(express)
        serverProcess = server.listen(settings.port)

        console.log(`Are We Down? started, listening on port ${settings.port}`)
    } 
}
