let fs = require('fs-extra'),
    yaml = require('js-yaml'),
    process = require('process'),
    sanitize = require('sanitize-filename'),
    _settings = {},
    allWatcherNames = [],
    settingsPath = './settings.yml'

if (fs.existsSync('./settings.dev.yml'))
    settingsPath = './settings.dev.yml'

if (settingsPath === './settings.dev.yml' || fs.existsSync(settingsPath))
    try {
        let settingsYML = fs.readFileSync(settingsPath, 'utf8')
        _settings = yaml.safeLoad(settingsYML)
    } catch (e) {
        console.log('Error reading settings.yml', e)
        throw e
    }
else 
    console.log(`WARNING: settings.yml not found - please create file in application folder ${process.cwd()}. If you are running in docker, mount your external settings.yml to this location.`)

function exitIfNotSet(value, message){
    if (value !== null && value !== undefined)
        return

    console.log(`ERROR: ${message}`)
    process.exit(1)
}    

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

// ensure that a default dashboard is defined
if (!Object.keys(_settings.dashboards).length)
    _settings.dashboards['default'] = { name : '' }

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
    const watcher = _settings.watchers[watcherName]

    // ensure value, user can force null
    watcher.recipients = watcher.recipients || '*'

    if (watcher.recipients === '*')
        watcher.recipients = allRecipientNames
    else {
        // ensure that recipient names match objects in recipient object
        let recipientNames = watcher.recipients.split(',').filter(r => !!r)
        for (const recipientName of recipientNames){
            if (!_settings.recipients[recipientName])
                console.log(`Recipient name ${recipientName} in watcher ${watcherName} is invalid`)
        }
    }

    if (watcher.test && ! fs.existsSync(`./tests/${watcher.test}.js`)){
        console.log(`ERROR: watcher "${watcherName}" test "${watcher.test}" does not exist`)
        process.exit(1)
    }
}

// validate SMTP (if enabled)
if (_settings.transports.smtp && _settings.transports.smtp.enabled){
    exitIfNotSet(_settings.transports.smtp.server, 'settings "transports.smtp" is missing expected value ".server"')
    exitIfNotSet(_settings.transports.smtp.port, 'settings "transports.smtp" is missing expected value ".port"')
    exitIfNotSet(_settings.transports.smtp.secure, 'settings "transports.smtp" is missing expected value ".secure"')
    exitIfNotSet(_settings.transports.smtp.user, 'settings "transports.smtp" is missing expected value ".user"')
    exitIfNotSet(_settings.transports.smtp.pass, 'settings "transports.smtp" is missing expected value ".pass"')
    exitIfNotSet(_settings.transports.smtp.from, 'settings "transports.smtp" is missing expected value ".from"')
}

// validate watchers
for (const name in _settings.watchers){
    const watcher = _settings.watchers[name]

    // todo : warn on multiple defaults
    exitIfNotSet(watcher.interval, `Watcher "${name}" has no interval`)
}

module.exports = _settings