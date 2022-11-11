let expressServer = null

module.exports = {

    /**
     * Starts the AreWedown? Server. 
     */
    async start(){
        console.log(`Are We Down? starting ... `)
        
        let server,
            fs = require('fs-extra'),
            http = require('http'),
            daemon = require('./daemon'),
            Express = require('express'),
            handlebarsLoader = require('madscience-handlebarsloader'),
            Settings = require('./settings'),
            transports = require('./transports'),
            express = Express(),
            startArgs = require('./startArgs').get()

        Settings.reset()
        let settings = Settings.get()

        // If starting with --version flag, print version from package.json then exit
        // When running live, package.json will get its version from git release tag - the build script is 
        // responsible for writing that tag to package.json. 
        // When running in dev mode, version always returns the placeholder value of "0.0.1", which must never
        // be updated.
        if (startArgs.version)
            return this.printVersion()

        await this.executeStartScript()
        
        // ensure/validate all the things
        await fs.ensureDir(settings.logs)
        await fs.ensureDir(settings.queue)
        await transports.ensureQueue()
        await transports.validateAll()
        
        express.set('json spaces', 4)

        // ready to start - load/start all the things
        await this.loadRoutes(express)
        await daemon.start()

        // config
        handlebarsLoader.initialize({ 
            forceInitialize : !settings.cacheViews,
            helpers : `${__dirname}/../views/helpers`,
            pages : `${__dirname}/../views/pages`,
            partials : `${__dirname}/../views/partials`,
        })

        server = http.createServer(express)
        expressServer = server.listen(settings.port)

        let status = `Are We Down? : Listening on port ${settings.port}`
        if (settings.rootpath !== '/') 
            status += `and rootpath: ${settings.rootpath}`

        console.log(status)
    },

    
    /**
     * 
     */
    async printVersion(){
        const fs = require('fs-extra'),
            packageJson = await fs.readJson(`${__dirname}/../package.json`)

        console.log(`AreWeDown? v${packageJson.version}`)
    },
    

    /**
     * Execute onstart shell command - this is intended for docker builds where the user wants to 
     * install app or set state in the container, but doesn't want to bake their own container image.
     * This state is ephemeral, so this solution isn't optimal, but it at least docker novices a chance
     * to run shell commands with advanced requirements.
     */
    async executeStartScript(){
        const settings = require('./settings').get(),
            sh = require('madscience-node-exec').sh,
            log = require('./logger').instance()

        if (!settings.onstart)
            return

        log.info('onstart command executing')
        let result = null
        try {
            result = await sh({ cmd : settings.onstart })
            log.info(`onstart finished with result : `, result)
        } catch(ex){
            if (settings.onstartIgnoreError){
                log.info(`onstart finished with result : `, result)
                log.info(`and ignored error : `, ex)
            }
            else
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
    }
   
}
