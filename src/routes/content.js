const log = require('./../lib/logger').instance()

module.exports = app => {

    /**
     * Serves static files (CSS, JS etc) from public folder. This is used instead of Express' built in static file middleware 
     * so we can serve files from inside pkg builds (express static file handler doesn't work with that)
     */
    app.get('/content/:path*', async (req, res)=>{
        try {
            res.download(`${__dirname}/../public/${req.params.path}/${req.params[0]}`)
        }catch(ex){
            log.error(`error loading content with params:"`, req.params, ex)
            res.status(404)
            res.end('That file doesn\t exist')
        }
    })
}