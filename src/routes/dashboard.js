module.exports = express => {



    /**
     * Renders a dashboard. Does not autoreload, autoreload must be called via the default url /
     * The autoreload frame will in turn call and autorefresh this dashboard view.
     */
    express.get('/dashboard/:dashboard?', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            let settings = require('./../lib/settings').get(),
                handlebarsLoader = require('madscience-handlebarsloader'),
                arrayHelper = require('./../lib/array'),
                daemon = require('./../lib/daemon'),
                firstAvailableDashboard = Object.keys(settings.dashboards)[0],
                dashboardNode = req.params.dashboard || firstAvailableDashboard,
                now = new Date(),
                view = await handlebarsLoader.getPage('dashboard'),
                dashboard = settings.dashboards[dashboardNode]

            if (!dashboard){
                view = await handlebarsLoader.getPage('invalidDashboard')
                res.status(404)

                return res.send(view({
                    dashboard: settings.dashboards[firstAvailableDashboard],
                    title : dashboardNode,
                }))
            }

            const dashboardWatchers = arrayHelper.split(dashboard.watchers, ','), // clone array, we don't want to change source
                // get cronprocesses that are running and used on the current dashboard
                watchers = daemon.watchers.filter(watcher => dashboardWatchers.includes(watcher.config.__name) )

            hasFailing = watchers.filter(watcher => watcher.status === 'down').length > 0

            // sort by status
            watchers.sort((a,b)=> a.status === 'down' && b.status !== 'down' ? -1 :
                b.status === 'down' && a.status !== 'down' ? 1
                : 0
            ) 
            // then by name
            watchers.sort((a,b)=>{ 
                if (a.status === 'down' && b.status !== 'down')
                    return a.config.name.localeCompare(b.config.name) ? 1 : -1
                else
                    return b.config.name.localeCompare(a.config.name) ? 1 : -1
            })
            
            // force update display times on watcher
            watchers.map(w => w.calculateDisplayTimes())
            
            res.send(view({
                title : `${settings.header} - ${dashboard.name}`,
                dashboardNode,
                dashboardRefreshInterval : settings.dashboardRefreshInterval,
                hasFailing,
                UIRestart: settings.UIRestart,
                renderDate : `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
                watchers,
                dashboards : Object.keys(settings.dashboards).length > 1 ? settings.dashboards : null
            }))
            
        } catch (ex){
            log.error(ex)
            res.status(500)
            res.end('Something went wrong - check logs for details.')
        }
    })
}