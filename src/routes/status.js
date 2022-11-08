module.exports = express => {

    /**
     * Returns a json string with the status of jobs
     */
    express.get('/status', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
           
            const daemon = require('./../lib/daemon'),
                failing = daemon.watchers.filter(watcher => 
                    watcher.status === 'down'
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

            hasFailing = watchers.filter(watcher => watcher.status === 'down').length > 0

            // force update display times on watcher
            watchers.map(w => w.calculateDisplayTimes())


            let out = []
            for (let watcher of watchers){
                out.push({
                    name: watcher.config.__name,
                    status : watcher.status,
                    errors : watcher.config.__hasErrors,
                    timeInState : watcher.timeInState,
                    errorMessage : watcher.errorMessage,
                    nextRun : watcher.nextRun 
                })
            }            

            // sort by status
            out.sort((a,b)=> a.status === 'down' && b.status !== 'down' ? -1 :
                b.status === 'down' && a.status !== 'down' ? 1
                : 0
            ) 
            // then by name
            out.sort((a,b)=>{ 
                if (a.status === 'down' && b.status !== 'down')
                    return a.name.localeCompare(b.name) ? 1 : -1
                else
                    return b.name.localeCompare(a.name) ? 1 : -1
            })

            res.json({
                watchers : out,
                hasFailing,
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