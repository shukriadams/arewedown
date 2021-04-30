let fs = require('fs-extra'),
    yaml = require('js-yaml'),
    process = require('process'),
    path = require('path'),
    sanitize = require('sanitize-filename'),
    _settings,
    rawSettings = {},
    allWatcherNames = []

if (fs.existsSync('./settings.yml')){
    try {
        let settingsYML = fs.readFileSync('./settings.yml', 'utf8')
        rawSettings = yaml.safeLoad(settingsYML)
    } catch (e) {
        console.log('Error reading settings.yml', e)
        throw e
    }
} else {
    console.log(`WARNINGS : settings.yml not found - please create file in application folder ${process.cwd()}. If you are running in docker, mount your external settings.yml to this location.`)
}



// force default structures
rawSettings = Object.assign({
    // basic settings
    version : 1,
    logs : './logs',
    emailSubject : 'Service failure',
    fromEmail : 'no-reply@example.com',
    dashboardLogs : './dashboards',
    port: 3000,
    dashboardRefreshInterval: 10000,
    dashboardLoadTimeout: 5000,
    partialFailCode : 230,
    cacheViews : true,
    allowHttpRestart: false,
    
    // internal work cleans up/maintains self. needs to run once a day only
    internalWorkerTimer : '0 0 * * *',
    // in days
    logRetention: 0, // daysd
    debug: false,
    
    // root-level objects
    dashboards : {},
    recipients : {},

    // transmission options
    transports : {},
    /* 
       smtp : {
            host : 'smtp.example.com',
            port: 123,
            secure : true|false,
            user: 'myuser',
            pass : 'mypassword'
        }
    */

}, rawSettings)


// apply default recipient settings
for (const recipient in rawSettings.recipients)
    rawSettings.recipients[recipient] = Object.assign({
        email : null,
        enabled : true,
        slackId: null
    }, rawSettings.recipients[recipient])


// apply default watcher settings
for (const name in rawSettings.watchers){
    
    allWatcherNames.push(name)

    // apply default watcher settings
    rawSettings.watchers[name] = Object.assign({
        __name : name,
        __safeName : sanitize(name),

        // users can add their own convenient name, if not this defaults to node name
        name : name,   

        // internal js test
        test: null,

        // string of user names to receive alerts on watcher status change. 
        // if null or empty, all recipients will be automatically added
        recipients : null,

        // external command. either test or cmd must be given
        cmd: null,

        // enabled field is optional and on by default
        enabled : true,

    }, rawSettings.watchers[name])
}

for (const name in rawSettings.dashboards){

    // apply default dashboard settings
    rawSettings.dashboards[name] = Object.assign({
        __name : name,  // node name, attached here for convenience
        __safeName : sanitize(name), // nodename, made safe for filesystems
        name : name,    // users can add their own convenient name, if not this defaults to node name

        // set to true to have this be the default dashboard when viewing '/' in a browser. if not set, the first
        // dashboard defined will be default. If multiple are defined with default, the first one defined is taken
        default : false,

        watchers : '*'  // force to all watchers
    }, rawSettings.dashboards[name])

    // if dashboard is set to * watchers, replace it's watchers list with literal names of all watchers
    if (rawSettings.dashboards[name].watchers.trim() === '*')
        rawSettings.dashboards[name].watchers = allWatcherNames.join(',')
}

_settings = rawSettings

// default values
const allRecipientNames = Object.keys(_settings.recipients).join(',')
for (const watcherName in _settings.watchers)
    // if a watcher has no explicit recipients list, assign all recipient names to list
    if (!_settings.watchers[watcherName].recipients)
        _settings.watchers[watcherName].recipients = allRecipientNames


       

// validate SMTP
if (_settings.transports.smtp){
    if (!_settings.transports.smtp.server)
        console.log('settings is missing expected value for "smtp.server"')

    if (!_settings.transports.smtp.port)
        console.log('settings is missing expected value for "smtp.port"')

    if (_settings.transports.smtp.secure === undefined)
        console.log('settings is missing expected value for "smtp.secure"')
}


// validate sendgrid
if (_settings.sendgrid){
    if (!_settings.sendgrid.key)
        console.log('settings is missing expected value for "sendgrid.key"')
}


// validate dashboards
if (!_settings.dashboards)
    console.log('WARNING - no dashboards set, nothing will be monitored.')

// validate watchers
for (const name in _settings.watchers){
    const watcher = _settings.watchers[name]

    // todo : warn on multiple defaults

    if (!watcher.interval){
        console.error(`Watcher "${name}" has no interval, it will not be run.`)
        _settings.watchers[name].enabled = false
        _settings.watchers[name].error = `No interval`
        continue
    }

    if (!_settings.watchers[name].cmd){
        _settings.watchers[name].test = _settings.watchers[name].test || 'net.httpCheck'
        if (!_settings.watchers[name].url) {
            _settings.watchers[name].enabled = false 
            _settings.watchers[name].error = `URL required if test is not defined`    
        }

        const testName = path.join(process.cwd(), 'tests', `${_settings.watchers[name].test}.js`)
        if (!fs.existsSync(testName)){
            _settings.watchers[name].enabled = false 
            _settings.watchers[name].error = `could not find internal test ${_settings.watchers[name].test}`    
        }
    }
}

for (const dashboardName in _settings.dashboards){
    const dashboard = _settings.dashboards[dashboardName]
    if (!dashboard.watchers || !Object.keys(dashboard.watchers).length)
        console.error(`Dashboard "${dashboardName}" has no watchers.`)
}

module.exports = _settings
   

