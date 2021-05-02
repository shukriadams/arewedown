let fs = require('fs-extra'),
    yaml = require('js-yaml'),
    process = require('process'),
    sanitize = require('sanitize-filename'),
    _settings = {},
    allWatcherNames = []

if (fs.existsSync('./settings.yml'))
    try {
        let settingsYML = fs.readFileSync('./settings.yml', 'utf8')
        _settings = yaml.safeLoad(settingsYML)
    } catch (e) {
        console.log('Error reading settings.yml', e)
        throw e
    }
else 
    console.log(`WARNINGS : settings.yml not found - please create file in application folder ${process.cwd()}. If you are running in docker, mount your external settings.yml to this location.`)


// apply default settings
_settings = Object.assign({
    // path all log data is written
    logs : './logs',

    port: 3000,

    // milliseconds
    dashboardRefreshInterval: 10000,

    // milliseconds
    dashboardLoadTimeout: 5000,

    // allows AWD to be restarte via HTTP call. Enable only if you trust people on your network not to abuse
    allowHttpRestart: false,

    // can be error, warn, info
    logLevel: 'warn',

    // internal work cleans up/maintains self. needs to run once a day only
    internalWorkerTimer : '0 0 * * *',

    // in days
    logRetention: 364, 
    
    // root-level objects
    dashboards : {},
    recipients : {},
    transports : {},

    // DEVELOPMENT STUFF

    // set to false when developing
    cacheViews : true
}, _settings)

// it's possible to set these items to null with goofy setup.yml content, so force defaults 
_settings.dashboards = _settings.dashboards || {}
_settings.recipients = _settings.recipients || {}
_settings.transports = _settings.transports || {}

// apply default recipient settings
for (const recipient in _settings.recipients)
    _settings.recipients[recipient] = Object.assign({
        enabled : true,
        email : null
    }, _settings.recipients[recipient])


// apply default watcher settings
for (const name in _settings.watchers){
    
    allWatcherNames.push(name)

    // apply default watcher settings
    _settings.watchers[name] = Object.assign({
        __name : name,
        __safeName : sanitize(name),
        
        // internally set error message. normally for validation text. merged with cronprocess's, .errorMessage
        __errorMessage: null,

        // system will flag watchers if they fail start validation. watchers with config errors
        // will not run (to save on error spam in logs), but will still be visible in dashboards
        __hasErrors: false,

        // users can add their own convenient name, if not this defaults to node name
        name : name,   

        //cronmask to time test
        interval : null,

        // internal test to call. must be in src/tests folder, must not have .js extension, egs `net.httpCheck`
        test: null,

        // string of user names to receive alerts on watcher status change. 
        // can be * to use all defined recipients
        recipients : '*',

        // external command. either test or cmd must be given
        cmd: null,

        // enabled field is optional and true by default. setting this to false will cause the 
        // watcher to be completely ignored
        enabled : true,

    }, _settings.watchers[name])

    // force default values based on logic  
    if (!_settings.watchers[name].cmd && !_settings.watchers[name].test)
        _settings.watchers[name].test = 'net.httpCheck'
}

// apply default dashboard settings
for (const name in _settings.dashboards){

    _settings.dashboards[name] = Object.assign({
        // node name, attached here for convenience
        __name : name,  

        // nodename, made safe for filesystems
        __safeName : sanitize(name), 

        // users can add their own convenient name, if not this defaults to node name
        name : name,    

        // set to true to have this be the default dashboard when viewing '/' in a browser. if not set, the first
        // dashboard defined will be default. If multiple are defined with default, the first one defined is taken
        default : false,

        // force to all watchers
        watchers : '*'  
    }, _settings.dashboards[name])

    // if dashboard is set to * watchers, replace it's watchers list with literal names of all watchers
    if (_settings.dashboards[name].watchers.trim() === '*')
        _settings.dashboards[name].watchers = allWatcherNames.join(',')
}


// if a watcher has no explicit recipients list, assign all recipient names to list
const allRecipientNames = Object.keys(_settings.recipients).join(',')
for (const watcherName in _settings.watchers){
    
    // ensure value, user can force null
    _settings.watchers[watcherName].recipients = _settings.watchers[watcherName].recipients || '*'

    if (_settings.watchers[watcherName].recipients === '*')
        _settings.watchers[watcherName].recipients = allRecipientNames
    else {
        // ensure that recipient names match objects in recipient object
        let recipientNames = _settings.watchers[watcherName].recipients.split(',').filter(r => !!r)
        for (const recipientName of recipientNames){
            if (!_settings.recipients[recipientName])
                console.log(`Recipient name ${recipientName} in watcher ${watcherName} is invalid`)
        }
    }
}

// validate SMTP
if (_settings.transports.smtp){
    if (!_settings.transports.smtp.server)
        console.log('settings is missing expected value for "smtp.server"')

    if (!_settings.transports.smtp.port)
        console.log('settings is missing expected value for "smtp.port"')

    if (_settings.transports.smtp.secure === undefined)
        console.log('settings is missing expected value for "smtp.secure"')
}

// validate dashboards
if (!_settings.dashboards)
    console.log('WARNING - no dashboards set, you won\'t be able to view watchers.')

// validate watchers
for (const name in _settings.watchers){
    const watcher = _settings.watchers[name]

    // todo : warn on multiple defaults

    if (!watcher.interval){
        console.error(`Watcher "${name}" has no interval, it will not be run.`)
        _settings.watchers[name].__hasErrors = true
        _settings.watchers[name].__errorMessage = `.interval not set`
        continue
    }
}

module.exports = _settings