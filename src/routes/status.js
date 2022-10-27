module.exports = express => {

    /**
     * Returns a json string with the status of jobs
     */
    express.get('/status', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
           
            const daemon = require('./../lib/daemon'),
                failing = daemon.watchers.filter(watcher => 
                    watcher.isPassing 
                    && !watcher.config.__hasErrors ? null : watcher)

            res.json({
                watchers : {
                    total : daemon.watchers.length,
                    failing : failing.length
                } 
            })
        } catch(ex){
            res.status(500)
            res.json({
                error : 'Something went wrong - check logs for details.'
            })
            log.error(ex)
        }
    })

    express.get('/status/dashboard/:dashboard', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
           
            let settings = require('./../lib/settings').get(),
                arrayHelper = require('./../lib/array'),
                daemon = require('./../lib/daemon'),
                history = require('./../lib/history'),
                timespan = require('./../lib/timespan'),
                dashboardNode = req.params.dashboard,
                dashboard = settings.dashboards[dashboardNode]

            if (!dashboard){
                
                res.status(404)

                return res.json({
                    error : true,
                    description : `'${dashboardNode}' is not a valid dashboard`
                })
            }

            const dashboardWatchers = arrayHelper.split(dashboard.watchers, ','), // clone array, we don't want to change source
                // get cronprocesses that are running and used on the current dashboard
                watchers = daemon.watchers.filter(watcher => dashboardWatchers.includes(watcher.config.__name) )

            hasErrors = watchers.filter(watcher => !watcher.isPassing).length > 0
            let out = []
            for (let watcher of watchers){
                const watcherLastEvent = await history.getLastEvent(watcher.config.__safeName)
                watcher.timeInState = ''
                
                if (watcherLastEvent)
                    watcher.timeInState = timespan(new Date(), watcherLastEvent.date)

                out.push({
                    name: watcher.config.__name,
                    isPassing: watcher.isPassing,
                    state : watcher.isPassing ? 'Up' : 'Down',
                    errors : watcher.config.__hasErrors,
                    timeInState : watcherLastEvent ? timespan(new Date(), watcherLastEvent.date) : null,
                    errorMessage : watcher.errorMessage,
                    nextRun : watcher.nextRun || null
                })
            }            

            out.sort((a,b)=> a.isPassing - b.isPassing || a.name.localeCompare(b.name))

            res.json({
                watchers : out,
                dashboard : dashboardNode
            })
        } catch(ex){
            res.status(500)
            res.json({
                error : true,
                description : 'Something went wrong - check logs for details.'
            })
            log.error(ex)
        }
    })

}