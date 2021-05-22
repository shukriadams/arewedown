const log = require('./../lib/logger').instance(),
    daemon = require('./../lib/daemon')

module.exports = app => {

    /**
     * Returns a count of failing jobs. Returns 0 if all jobs are passing.
     */
    app.get('/status/failing', async (req, res)=>{
        try {
           
            let cronJobs = daemon.watchers.slice(0),
                failingJobs = cronJobs.filter(job => 
                    job.isPassing 
                    && !job.config.__hasErrors ? null : job)

            res.send(failingJobs.length.toString())
        }catch(ex){
            res.status(500)
            res.end('Something went wrong - check logs for details.')
            log.error(ex)
        }
    })

    
    /**
     * Simple alive check
     */
    app.get('/status/isalive', (req, res)=>{
        res.send('ARE WE DOWN? service is running')
    })
}