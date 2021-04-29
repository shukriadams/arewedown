(async ()=>{
    try{
        const server = require('./lib/server')
        
        // loop forever, stop server if a restart has been requested.
        // Then start server if it is stopped
        setInterval(async ()=>{
            if (server.stopRequested){
                console.log('restarting ...')
                await server.stop()
            }

            if (!server.isRunning)
                await server.start()
        }, 1000)

    }catch(ex){
        console.log(ex)
    }
})()