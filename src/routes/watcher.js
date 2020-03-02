const handlebars = require('./../lib/handlebars'),
    path = require('path'),
    fs = require('fs-extra'),
    jsonfile= require('jsonfile'),
    fsUtils = require('madscience-fsUtils'),
    logger = require('./../lib/logger').instance(),
    settings = require('./../lib/settings').get();

module.exports = function(app){
    app.get('/watcher/:watcher', async function(req, res){
        try {
            const watcher = settings.watchers[req.params.watcher];
            if (!watcher){
                const view = handlebars.getView('invalidWatcher');
                return res.send(view({
                    title : req.params.watcher
                }));
            }
    
            const index = parseInt(req.query.index) || 0,
                pagesize = parseInt(req.query.pagesize) || 50,
                historyFolder = path.join(settings.logs, watcher.__safeName, 'history');

            if (!await fs.exists(historyFolder))
                throw `Expected history folder "${historyFolder}" not found.`

            let files = await fsUtils.readFilesUnderDirSync(historyFolder, false);
            files = files.filter((file)=>{ return file != 'status.json' });
            files = files.slice(index, pagesize);
            files = files.sort();
            let history = [];
            for(const file of files){
                let data = await jsonfile.readFile(path.join(historyFolder, file));
                history.push(data);
            }
            
            console.log(history);
    
            let view = handlebars.getView('watcher');
            res.send(view({
                title : 'Are we down?',
                history
            }));
        }catch(ex){
            res.status(500);
            res.end('Something went wrong - check logs for details.');
            logger.error.error(ex);
        }
    });
}