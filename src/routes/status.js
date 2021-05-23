module.exports = express => {

    /**
     * Returns a count of failing jobs. Returns 0 if all jobs are passing.
     */
    express.get('/status/failing', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
           
            const daemon = require('./../lib/daemon'),
                failingJobs = daemon.watchers.filter(job => 
                    job.isPassing 
                    && !job.config.__hasErrors ? null : job)

            res.send(failingJobs.length.toString())
        }catch(ex){
            res.status(500)
            res.end('Something went wrong - check logs for details.')
            log.error(ex)
        }
    })

}