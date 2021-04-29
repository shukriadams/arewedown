let winston = require('winston'),
    fs = require('fs-extra'),
    _watcherLogs = null,
    _global,
    path = require('path'),
    settings = require('./settings')

class Logger {
    constructor(logFolder){

        if (!fs.existsSync(logFolder))
            fs.mkdirSync(logFolder);

        // apply rotation override for winston
        require('winston-daily-rotate-file');

        this.info = new (winston.Logger)({
            transports: [
                new (winston.transports.DailyRotateFile)({
                    filename: path.join(logFolder, '.log'),
                    datePattern: 'info.yyyy-MM-dd',
                    prepend: true,
                    level: 'info'
                })
            ]
        });

        this.error = new (winston.Logger)({
            transports: [
                new (winston.transports.DailyRotateFile)({
                    filename: path.join(logFolder, '.log'),
                    datePattern: 'error.yyyy-MM-dd',
                    prepend: true,
                    level: 'error'
                })]
        });

    }
}

module.exports = {
    
    // returns an instance of the global log
    instance : function(){
        if (!_global){
            _global = new Logger(settings.logs);
        }
        return _global;
    },

    // returns an instance of logger
    instanceWatcher : function(name) {
        
        if (!_watcherLogs){
            _watcherLogs = {};

            for(const name in settings.watchers) {
                const watcher = settings.watchers[name],
                    logpath = path.join(settings.logs, watcher.__safeName, 'logs');
    
                fs.ensureDirSync(logpath);
                _watcherLogs[watcher.__name] = new Logger(logpath);
            }
        }

        return _watcherLogs[name];
    }

};