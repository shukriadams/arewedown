module.exports = express => {

    /**
     * Immediately forces a tick on all watchers, which forces them to run their tests immediately. This 
     * does not change the timer on any tests.
     */
    express.get('/rerun/dashboard/:dashboard?', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            const settings = require('./../lib/settings').get(),
                daemon = require('./../lib/daemon')

            if (!settings.UIRestart){
                res.status(403)
                res.end('Not allowed. set "UIRestart:true" to enable restart')
                return
            }

            let count = 0,
                targetDashboardName = req.params.dashboard || settings.dashboards[Object.keys(settings.dashboards)[0]].__name,
                targetDashboard = settings.dashboards[targetDashboardName],
                targetWatchers = targetDashboard.watchers
                    .split(',')
                    .map(r => r.trim())

            for (const watcher of daemon.watchers){
                if (!targetWatchers.includes(watcher.config.__name) && !targetWatchers.includes('*'))
                    continue

                watcher.tick()
                count ++
            }
            

            res.end(`Reran ${count} watchers`)

        } catch (ex){
            log.error(ex)
            res.status(500)
            res.end('Something went wrong - check logs for details.')
        }
    })
}