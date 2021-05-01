let serverProcess,
    express,
    server,
    daemon = require('./daemon')

module.exports = {
    isRunning : false,

    stopRequested : false,

    async start(){
        try{

            const http = require('http'),
                Express = require('express'),
                process = require('process'),
                fs = require('fs-extra'),
                path = require('path'),
                settings = require('./settings'),
                smtp = require('./smtp'),
                sh = require('madscience-node-exec').sh,
                routeFiles = fs.readdirSync(path.join(__dirname, '../routes'))

            express = Express()
        
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
                this.stopRequested = true
                res.end('restart request')
            })

            // load routes
            for (const routeFile of routeFiles){
                const name = routeFile.match(/(.*).js/).pop(),
                    routes = require(`./../routes/${name}`)
        
                routes(express)
            }
            
            if(settings.transports.smtp)
                await smtp.ensureSettingsOrExit()

            await daemon.start()
            
            server = http.createServer(express)
            serverProcess = server.listen(settings.port)
            console.log(`Listening on port ${settings.port}`)
            this.isRunning = true
        } catch(ex){
            console.log(ex)
        }
        
    },

    stop(){
        return new Promise(async (resolve, reject)=>{
            try {
                
                await daemon.stop()
                // force false incase server was restarted, else it will go into shutdown request immediately after restart
                this.stopRequested = false 

                const createHttpTerminator = require('http-terminator').createHttpTerminator,
                    httpTerminator = createHttpTerminator({
                        server,
                    })
              
                await httpTerminator.terminate()
                

                serverProcess.close(async ()=>{
                    console.log('server has exited')

                    this.isRunning = false
                    resolve()
                })

            } catch (ex){
                reject(ex)
            }
        })
    }
}

