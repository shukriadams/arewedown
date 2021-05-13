const settings = require('./../lib/settings'),
    process = require('process')

module.exports = express => {

    /**
     * Shuts the application down. This is the cleanest way to apply new settings without having to restart the service or docker container,
     * as a properly daemonized app will instantly restart.
     */
    express.get('/exit', async (req, res)=>{

        if (!settings.allowHttpExit){
            res.status(403)
            res.end('Not allowed. set "allowHttpExit:true" to enable restart')
            return
        }

        const message = 'Application shutting down from /exit request'
        console.log(message)
        res.end(message)
        process.exit(0)
    })

}