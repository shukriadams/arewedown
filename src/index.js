(()=>{
    let server = require('./lib/server'),
        started = false

    try {
        // overly-elaborate forced restart loop so we can change app settings at runtime and fake an app
        // restart
        setInterval(async ()=>{
            try {

                if (!started || global.__restartServer === true){
                    started = true
                    global.__restartServer = false
                    console.log('ARE we down server starting')
                    await server.exit()
                    await server.start()
                }
            }
            catch(ex){
                if (ex === 'forced test error')
                    return process.exit(0)
                console.log('error starting : ', ex)
            } 
        }, 1000)
    } catch (ex){
        console.log('Are We Down? exited with error:',ex)
    }
})()
