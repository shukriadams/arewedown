module.exports = express => {
    
    /**
     * Get an object containing a list of all dashboards
     */
     express.get('/api/dashboards', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            let settings = require(_$+'lib/settings').get(),
                dashboards = Object.keys(settings.dashboards)

            res.json({
                dashboards 
            })
        } catch(ex){
            res.status(500)
            res.json({
                error : 'Something went wrong - check logs for details.'
            })
            log.error(ex)
        }
    })

}