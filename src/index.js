const startArgs = require('./lib/startArgs').get(),
    server = require('./lib/server'),
    fs = require('fs-extra')

// If starting with --version flag, print version from package.json then exit
// When running live, package.json will get its version from git release tag - the build script is 
// responsible for writing that tag to package.json. 
// When running in dev mode, version always returns the placeholder value of "0.0.1", which must never
// be updated.
if (startArgs.version){

    (async ()=>{
        const package = await fs.readJson(`${__dirname}/package.json`)
        console.log(`AreWeDown? v${package.version}`)
    })()

} else {

    // Start the server if not in unit testing mode. Else pass server on to caller, which will be testing code
    if (!startArgs.testing)
        (async ()=>{
            try {
                await server.start()
            } catch (ex){
                console.log('Are We Down? exited on error:',ex)
            }
        })()
}



module.exports = server