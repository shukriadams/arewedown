module.exports = express => {
    /**
     * Serves static files (CSS, JS etc) from public folder. This is used instead of Express' built in static file middleware 
     * so we can serve files from inside pkg builds (express static file handler doesn't work with that)
     */
    express.get('/content/:path*', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            res.download(`${__dirname}/../public/${req.params.path}/${req.params[0]}`)
        }catch(ex){
            log.error(`error loading content with params:"`, req.params, ex)
            res.status(404)
            res.end('That file does not exist')
        }
    })
}
