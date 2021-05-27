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
        }catch(ex){
            res.status(500)
            res.json({
                error : 'Something went wrong - check logs for details.'
            })
            log.error(ex)
        }
    })

}