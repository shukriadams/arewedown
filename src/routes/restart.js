module.exports = express => {

    /**
     * Shuts the application down. This is the cleanest way to apply new settings without having to restart the service or docker container,
     * as a properly daemonized app will instantly restart.
     */
    express.get('/restart', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            const settings = require('./../lib/settings').get(),
                process = require('process')

            if (!settings.UIRestart){
                res.status(403)
                res.end('Not allowed. set "UIRestart:true" to enable restart')
                return
            }

            console.log('Application shutting down from /exit request')
            res.end('restarting')
            process.exit(0)

        } catch (ex){
            log.error(ex)
            res.status(500)
            res.end('Something went wrong - check logs for details.')
        }
    })
}