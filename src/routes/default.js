module.exports = express => {

    /**
     * This is the default view of this site. To load use
     * 
     *      localhost:3000/
     * 
     * To load with a specific dashboard use
     * 
     *      localhost:3000/[dashboard node name]
     * 
     * Loads an autoreload frame, this frame uses JS + iframes to autoreload a dashboard view without flickering.
     * If no (:dashboard) parameter is supplied, the first dashboard is automatically targetted.
     * 
     */
    express.get('/', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            let settings = require('./../lib/settings').get(),
                handlebarsLoader = require('madscience-handlebarsloader'),
                definedDashboardKeys = Object.keys(settings.dashboards),
                dashboardNode
            
            // take first dashboard marked as default
            for (let dashboardName of definedDashboardKeys)
                if (settings.dashboards[dashboardName].default){
                    dashboardNode = dashboardName
                    break
                }

            // if no default, take first dashboard
            if (!dashboardNode && definedDashboardKeys.length)
                dashboardNode = definedDashboardKeys[0]
                
            const view = await handlebarsLoader.getPage('default')
            res.send(view({
                dashboardNode,
                dashboardLoadTimeout : settings.dashboardLoadTimeout,
                dashboardRefreshInterval : settings.dashboardRefreshInterval,
            }))
        } catch (ex){
            log.error(ex)
            res.status(500)
            res.end('Something went wrong - check logs for details.')
        }
    })
}