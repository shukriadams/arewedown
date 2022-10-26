/**
 * 
 */
module.exports = express => {

    /**
     * Changes status of watchers. Use this as a dev tool
     */
    express.get('/dev/randomize', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            let settings = require('./../lib/settings').get(),
                Chance = require('chance'),
                chance = new Chance(),
                daemon = require('./../lib/daemon')

            if (!settings.allowDevRoutes){
                res.status(403)
                return res.end('Access denied. Enable allowDevRoutes in settings to enable')
            }

            let changed = [],
                forceAll = chance.bool({ likelihood: 20 }),
                forceAllState = chance.bool()

            for (let watcher of daemon.watchers){
                const isPassing = forceAll ? forceAllState : chance.bool() 
                if (isPassing != watcher.isPassing)
                    changed.push(watcher.config.name)

                watcher.isPassing = isPassing
                watcher.errorMessage = chance.sentence({ words: chance.integer({ min: 10, max: 30 }) })
                watcher.stop()
            }

            res.end(`${changed.length} changed - ${changed.join(',')}`)
        } catch(ex){
            res.status(500)
            res.end('Something went wrong - check logs for details.')
            log.error(ex)
        }
    })
}