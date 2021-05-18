const startArgs = require('./lib/startArgs').get(),
    server = require('./lib/server')

    // Start the server if not in unit testing mode. Else pass server on to caller, which will be testing code
    if (!startArgs.testing)
        (async ()=>{
            try {
                await server.start()
            } catch (ex){
                console.log('Are We Down? exited on error:',ex)
            }
        })()

module.exports = server