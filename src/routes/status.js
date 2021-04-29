const logger = require('./../lib/logger').instance(),
    daemon = require('./../lib/daemon');

module.exports = function(app){

    /**
     * Returns a count of failing jobs. Returns 0 if all jobs are passing.
     */
    app.get('/status/failing', async function(req, res){
        try {
           
            let cronJobs = daemon.getCronJobs().slice(0); // clone array, we don't want to change source

            const failingJobs = cronJobs.filter((job)=>{
                return job.isPassing || job.config.enabled === false ? null : job;
            });

            res.send(failingJobs.length.toString());
        }catch(ex){
            res.status(500);
            res.end('Something went wrong - check logs for details.');
            logger.error.error(ex);
        }
    });

    
    /**
     * Simple alive check
     */
    app.get('/status/isalive', function(req, res){
        res.send('ARE WE DOWN? service is running');
    });
}