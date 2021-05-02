(async function(){

    let process = require('process'),
        fs = require('fs-extra'),
        path = require('path'),
        settings = require('./lib/settings'),
        argv = require('minimist')(process.argv.slice(2))
    
    if (!argv.watcher){
        console.error(`ERROR : Watcher required. Use "--watcher [watcher_name]"`)
        process.exit(1)
    }

    let watcher = settings.watchers[argv.watcher]

    if (!watcher){
        console.error(`ERROR : Watcher ${argv.watcher} does not exist, check setup YML file.`)
        process.exit(1)
    }


    let test = watcher.test ? watcher.test : 'system/basic',
        testName = path.join('./tests', test),
        testModule = `./${testName}`

    if (!await fs.exists(`${testName}.js`)){
        console.error(`ERROR : Test "${test}" in watcher "${argv.watcher}" could not be found.`)
        process.exit(1)
    }

    try {
        let test = require(testModule)
        await test.call(this, watcher)
        console.log('Test passed!')
    } catch(ex){
        console.error('Test failed')
        console.error(ex)
    }    
   
})()