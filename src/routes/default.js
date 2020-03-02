
const settings = require('./../lib/settings').get(),
    handlebars = require('./../lib/handlebars');
    arrayHelper = require('./../lib/array'),
    daemon = require('./../lib/daemon');

module.exports = function(app){
        
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
    app.get('/:dashboard?', async function(req, res){
        let dashboardNode = req.params.dashboard;

        // fall back to first dashboard
        if (!dashboardNode && settings.dashboards){
            let definedDashboardKeys = Object.keys(settings.dashboards);
            if (definedDashboardKeys.length)
                dashboardNode = definedDashboardKeys[0];
        }

        const view = handlebars.getView('autoreloader');
        res.send(view({
            dashboardNode,
            dashboardRefreshInterval : settings.dashboardRefreshInterval,
        }));
    });

    



}