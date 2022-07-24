(()=>{
    let server = require('./lib/server'),
        started = false

    try {
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
                console.log('error starting ', ex)
            } 
        }, 1000)
    } catch (ex){
        console.log('Are We Down? exited with error:',ex)
    }
})()
