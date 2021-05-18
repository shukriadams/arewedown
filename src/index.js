(async ()=>{

    const startArgs = require('./lib/startArgs').get(),
        process = require('process'),
        server = require('./lib/server'),
        fs = require('fs-extra')

    // If starting with --version flag, print version from package.json then exit
    // When running live, package.json will get its version from git release tag - the build script is 
    // responsible for writing that tag to package.json. 
    // When running in dev mode, version always returns the placeholder value of "0.0.1", which must never
    // be updated.
    if (startArgs.version){
        const package = await fs.readJson(`${__dirname}/package.json`)
        console.log(`AreWeDown? v${package.version}`)
        return process.exit(0)
    }

    // Start the server if not in unit testing mode. Else pass server on to caller, which will be testing code
    if (!startArgs.testing)
        await server.start()

    module.exports = server
})()