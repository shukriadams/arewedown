let fs = require('fs-extra'),
    winstonWrapper = require('winston-wrapper'),
    _watcherLogs = null,
    _global,
    path = require('path'),
    settings = require('./settings').get()

module.exports = {
    
    // returns an instance of the global log
    instance (){
        if (!_global)
            _global = winstonWrapper.new(settings.logs, settings.logLevel).log

        return _global
    },

    // returns an instance of logger
    instanceWatcher(name) {
        
        if (!_watcherLogs){
            _watcherLogs = {}

            for(const name in settings.watchers) {
                const watcher = settings.watchers[name],
                    logpath = path.join(settings.logs, watcher.__safeName, 'logs')
    
                fs.ensureDirSync(logpath)
                _watcherLogs[watcher.__name] = winstonWrapper.new(logpath, settings.logLevel).log
            }
        }

        return _watcherLogs[name]
    }

}