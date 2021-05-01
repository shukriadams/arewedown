const logger = require('./../lib/logger').instance(),
    daemon = require('./../lib/daemon')

module.exports = app => {

    /**
     * Returns a count of failing jobs. Returns 0 if all jobs are passing.
     */
    app.get('/status/failing', async (req, res)=>{
        try {
           
            let cronJobs = daemon.getWatchers().slice(0) // clone array, we don't want to change source

            const failingJobs = cronJobs.filter(job => job.isPassing && !job.config.__hasErrors ? null : job)

            res.send(failingJobs.length.toString())
        }catch(ex){
            res.status(500)
            res.end('Something went wrong - check logs for details.')
            logger.error.error(ex)
        }
    })

    
    /**
     * Simple alive check
     */
    app.get('/status/isalive', (req, res)=>{
        res.send('ARE WE DOWN? service is running')
    })
}