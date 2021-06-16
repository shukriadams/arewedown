/**
 * Creates fake history for all existing watchers. For dev purposes
 * Ensure that node_modules have already been installed
 * use :
 * 
 * node ./generateHistory
 * 
 */

(async()=>{
    const fsUtils = require('madscience-fsUtils'),
        timebelt = require('timebelt'),
        path = require('path'),
        Chance = require('chance'),
        chance = new Chance(),        
        maxEventsPerWatcher = 20,
        minEventDuration = 1, // seconds
        maxEventDuration = 2562000 // 30 days in seconds
        fs = require('fs-extra')

    if (!await fs.exists('./../logs')){
        console.log('./logs folder not found - start app first to autogenerate')
        return
    }
        
    
    const watchers = await fsUtils.getChildDirs('./../logs')
    if (!watchers.length){
        console.log('!! No watchers founds - define at least one watcher in ./config/settings.yml.')
        return
    }

    for (const watcher of watchers){
        
        const watcherHistoryDir = path.join(watcher, 'history')
        if (!await fs.exists(watcherHistoryDir)){
            console.log(`history folder for watcher "${watcher}" not found`)
            continue
        }

        // delete existing history
        const existingEvents = await fsUtils.readFilesUnderDir(watcherHistoryDir)
        for (const file of existingEvents)
            await fs.remove(file)

        let isPassing = true,
            startDate = new Date()
            
        for (let i = 0 ; i < maxEventsPerWatcher; i ++){
            startDate = timebelt.addSeconds(startDate, chance.integer({min : minEventDuration, max : maxEventDuration})) 
            isPassing = !isPassing
            
            let error = isPassing ? undefined : chance.sentence({ words: chance.integer({ min: 10, max: 300 })})

            await fs.writeJson(path.join(watcherHistoryDir, `${startDate.getTime()}.json`),{
                status : isPassing ? 'up' : 'down',
                date : startDate,
                error
            })
        }
    }


})()

