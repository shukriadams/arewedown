

module.exports = {

    /**
     * Starts the AreWedown? Server. 
     */
    async start(){

        let server,
            fs = require('fs-extra'),
            http = require('http'),
            daemon = require('./daemon'),
            Express = require('express'),
            express = Express(),
            settings = require('./settings'),
            startArgs = require('./startArgs').get()
        

        // If starting with --version flag, print version from package.json then exit
        // When running live, package.json will get its version from git release tag - the build script is 
        // responsible for writing that tag to package.json. 
        // When running in dev mode, version always returns the placeholder value of "0.0.1", which must never
        // be updated.
        if (startArgs.version)
            return this.printVersion() // return code is test aid

        await this.executeStartScript()
        
        // ensure/validate all the things
        await fs.ensureDir(settings.logs)
        await this.validateTransports()


        // ready to start - load/start all the things
        await this.loadRoutes(express)
        await daemon.start()
        
        server = http.createServer(express)
        server.listen(settings.port)

        console.log(`Are We Down? started, listening on port ${settings.port}`)
    },


    /**
     * 
     */
    async printVersion(){
        const fs = require('fs-extra'),
            package = await fs.readJson(`${__dirname}/../package.json`)

        console.log(`AreWeDown? v${package.version}`)
        return package.version 
    },
    

    /**
     * Execute onstart shell command - this is intended for docker builds where the user wants to 
     * install app or set state in the container, but doesn't want to bake their own container image.
     * This state is ephemeral, so this solution isn't optimal, but it at least docker novices a chance
     * to run shell commands with advanced requirements. Options are nice.
     */
    async executeStartScript(){
        const settings = require('./settings'),
            sh = require('madscience-node-exec').sh,
            log = require('./logger').instance()

        if (!settings.onstart)
            return

        log.info('onstart command executing')

        try {
            const result = await sh({ cmd : settings.onstart })
            log.info(`onstart finished with result : `, result)
        } catch(ex){
            throw { text : `onstart failed with error : `, ex }
        }
    },


    /**
     * load express routes - these are all files in .src/routes folder
     */
    async loadRoutes(express){
        const path = require('path'),
            fs = require('fs-extra'),
            routeFiles = await fs.readdir(path.join(__dirname, '/../routes'))

        for (const routeFile of routeFiles){
            const routeFileName = routeFile.match(/(.*).js/).pop(),
                route = require(`./../routes/${routeFileName}`)
    
            route(express)
        }
    },


    /**
     * validate active transport's settings by attempting to contact provider 
     */
    async validateTransports(){
        const settings = require('./settings')

        for (const transportName in settings.transports){
            if (!settings.transports[transportName].enabled)
                continue

            const transport = require(`./${transportName}`)
            if (!transport.ensureSettingsOrExit)
                throw `transport method "${transportName}" missing expected method "ensureSettingsOrExit"`

            await transport.ensureSettingsOrExit()
        }
    }
   
}
