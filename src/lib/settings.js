let fs = require('fs-extra'),
    yaml = require('js-yaml'),
    sanitize = require('sanitize-filename'),
    _settings;

module.exports = {
    get : function(forceRead){

        if (!_settings || forceRead === true){
            let rawSettings = null;

            try {
                let settingsYML = fs.readFileSync('./settings.yml', 'utf8');
                rawSettings = yaml.safeLoad(settingsYML);
            } catch (e) {
                console.log('Error reading settings.yml');
                console.log(e);
                throw e;
            }
            
            // force default structures
            rawSettings = Object.assign({
                // basic settings
                version : 1,
                logs : './logs',
                watcherLogs : './watchers',
                emailSubject : 'Service failure',
                dashboardLogs : './dashboards',
                port: 3000,
                dashboardRefreshInterval: 10000,
                partialFailCode : 230,

                // root-level objects
                dashboards : {},
                recipients : {},

                // transmission options
                smtp : null,
                slack: null,
                sendgrid : null

            }, rawSettings);
    
            for (const name in rawSettings.dashboards){

                let dashboard = rawSettings.dashboards[name];

                rawSettings.dashboards[name] = Object.assign({
                    __name : name, // node name, attached here for convenience
                    __safeName : sanitize(name), // nodename, made safe for filesystems
                    name : name,   // users can add their own convenient name, if not this defaults to node name
                }, dashboard);
            }

            for (const name in rawSettings.watchers){

                let watcher = rawSettings.watchers[name];

                rawSettings.watchers[name] = Object.assign({
                    __name : name,
                    __safeName : sanitize(name),
                    name : name,   // users can add their own convenient name, if not this defaults to node name

                    // enabled field is optional and on by default
                    enabled : true,
                }, watcher);
            }

            _settings = rawSettings;

            // default values
            for (const watcherName in _settings.watchers){
                const watcher = _settings.watchers[watcherName];
                if (!watcher.recipients){
                    watcher.recipients ='';
                    for (const recipient in _settings.recipients)
                        watcher.recipients = `${recipient},`;
                }
            }

        }

        return _settings;
    },

    validate: function(){
        const settings = this.get();
        
        // validate SMTP
        if (settings.smtp){
            if (!settings.smtp.server)
                console.log('settings is missing expected value for "smtp.server"');
        
            if (!settings.smtp.port)
                console.log('settings is missing expected value for "smtp.port"');
        
            if (settings.smtp.secure === undefined)
                console.log('settings is missing expected value for "smtp.secure"');
        }

        // validate sendgrid
        if (settings.sendgrid){
            if (!settings.sendgrid.key)
                console.log('settings is missing expected value for "sendgrid.key"');
        }

        // validate dashboards
        if (!settings.dashboards)
            console.log('WARNING - no dashboards set, nothing will be monitored.');

        for (const name in settings.watchers){
            const watcher = settings.watchers[name];

            if (!watcher.interval){
                console.error(`Watcher "${name}" has no interval, it will not be run.`);
                delete settings.watchers[name];
                continue;
            }

        }

        for (const dashboardName in settings.dashboards){
            const dashboard = settings.dashboards[dashboardName];
            if (!dashboard.watches || !Object.keys(dashboard.watches).length)
                console.error(`Dashboard "${dashboardName}" has no watchers.`);

            for(const watchName in dashboard.watches){
                const watch = dashboard.watches[watchName];
                if (!watch.test && !wactch.url)
                    console.error(`Watch ${watchName} in dashboard ${dashboardName} has no test or url defined.`);
            }
        }
    }
}

