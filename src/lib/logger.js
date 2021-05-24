let _watcherLogs,
    _global

module.exports = {
    
    reset(){
        _watcherLogs = null
        _global = null
    },

    // returns an instance of the global log
    instance (){
        const winstonWrapper = require('winston-wrapper'),
            settings = require('./settings').get()

        if (!_global)
            _global = winstonWrapper.new(settings.logs, settings.logLevel).log

        return _global
    },

    // returns an instance of logger
    instanceWatcher(name) {
        const fs = require('fs-extra'), 
            winstonWrapper = require('winston-wrapper'),
            path = require('path'),
            settings = require('./settings').get()

        if (!_watcherLogs){
            _watcherLogs = {}

            for(const name in settings.watchers) {
                const watcher = settings.watchers[name],
                    logpath = path.join(settings.logs, watcher.__safeName, 'logs')
    
                fs.ensureDirSync(logpath)
                _watcherLogs[watcher.__name] = winstonWrapper.new(logpath, settings.logLevel).log
            }
        }

        // if log still failed to create
        return _watcherLogs[name] 
    }

}