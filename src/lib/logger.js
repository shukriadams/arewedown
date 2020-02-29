let winston = require('winston'),
    fs = require('fs-extra'),
    _watcherLogs = {},
    _global,
    path = require('path'),
    settings = require('./settings').get();

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
    
    // inits the global log, this is used by trusty-daemon for its own errors.
    instance : function(){
        if (!_global){
            _global = new Logger(settings.logPath);
        }
        return _global;
    },

    // initializes loggers used for each job
    initialize : async function(){
        for(const name in settings.watchers) {
            const watcher = settings.watchers[name],
                logpath = path.join(settings.watcherLogs, watcher.__safeName, 'logs');

            await fs.ensureDir(logpath);
            _watcherLogs[watcher.__name] = new Logger(logpath);
        }
    },

    // returns an instance of logger
    instanceWatcher : function(name) {
        return _watcherLogs[name];
    }

};