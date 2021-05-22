
const settings = require('./../lib/settings'),
    handlebarsLoader = require('madscience-handlebarsloader')

module.exports = app =>{


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
    app.get('/', async (req, res)=>{
        let definedDashboardKeys = Object.keys(settings.dashboards),
            dashboardNode = req.query.dashboard
        
        // take first dashboard marked as default
        for (let dashboardName of definedDashboardKeys)
            if (settings.dashboards[dashboardName].default === true){
                dashboardNode = dashboardName
                break
            }

        // if no default, take first dashboard
        if (!dashboardNode && definedDashboardKeys.length)
            dashboardNode = definedDashboardKeys[0]
            
        const view = await handlebarsLoader.getPage('dashboard')
        res.send(view({
            dashboardNode,
            dashboardLoadTimeout : settings.dashboardLoadTimeout,
            dashboardRefreshInterval : settings.dashboardRefreshInterval,
        }))
    })

}