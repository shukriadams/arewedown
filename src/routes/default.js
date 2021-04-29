
const settings = require('./../lib/settings'),
    handlebars = require('./../lib/handlebars')

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
        const definedDashboardKeys = Object.keys(settings.dashboards)
        if (definedDashboardKeys.length)
            dashboardNode = definedDashboardKeys[0]
            
        const view = handlebars.getView('dashboard')
        res.send(view({
            dashboardNode,
            dashboardLoadTimeout : settings.dashboardLoadTimeout,
            dashboardRefreshInterval : settings.dashboardRefreshInterval,
        }))
    })

}