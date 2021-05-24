(async ()=>{
    const server = require('./lib/server')

    try {
        await server.start()
    } catch (ex){
        console.log('Are We Down? exited with error:',ex)
    }
})()
