

let fs = require('fs-extra'),
    yaml = require('js-yaml'),
    process = require('process'),
    dotenv = require('dotenv'),
    sanitize = require('sanitize-filename'),
    allWatcherNames = [],
    settingsPath = './config/settings.yml',
    _settings = {}

dotenv.config()

if (fs.existsSync('./config/settings.dev.yml'))
    settingsPath = './config/settings.dev.yml'

if (settingsPath === './config/settings.dev.yml' || fs.existsSync(settingsPath))
    try {
        let settingsYML = fs.readFileSync(settingsPath, 'utf8')
        _settings = yaml.safeLoad(settingsYML)
    } catch (e) {
        console.log('Error reading settings.yml', e)
        throw e
    }
else 
    console.warn(`WARNING: settings.yml not found - please create file "<AreWeDown bin>/config/settings.yml". If you are running in docker, mount your external config folder to "/etc/arewdown/config", and ensure you have settings.yml in that folder.`)

function exitIfNotSet(value, message){
    if (value !== null && value !== undefined)
        return

    throw message
}    


// apply default settings
_settings = Object.assign({

    // override default title
    header: 'Are We Down?',

    // path all log data is written
    logs : './logs',

    port: 3000,

    // milliseconds
    dashboardRefreshInterval: 5000,

    // milliseconds
    dashboardLoadTimeout: 5000,

    // allows AWD to be restarte via HTTP call. Enable only if you trust people on your network not to abuse
    allowHttpExit: false,

    // can be error, warn, info
    logLevel: 'warn',

    // internal work cleans up/maintains self. needs to run once a day only
    internalWorkerTimer : '0 0 * * *',

    // in days. set to zero to disable.
    logRetention: 365, 
    
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
for (const recipient in _settings.recipients){

    _settings.recipients[recipient] = Object.assign({
        enabled : true,
        smtp : null
    }, _settings.recipients[recipient])

    // remove if disabled
    if (!_settings.recipients[recipient].enabled)
        delete _settings.recipients[recipient]
}

// apply defaults to transports
for (const transport in _settings.transports){
    _settings.transports[transport] = Object.assign({
        enabled : true
    }, _settings.transports[transport])

    // remove if disabled
    if (!_settings.transports[transport].enabled)
        delete _settings.transports[transport]
}

// apply default watcher settings
for (const name in _settings.watchers){
    let watcher = _settings.watchers[name]

    // apply default watcher settings
    watcher = Object.assign({
        __name : name,
        __safeName : sanitize(name),
        
        // internally set error message. normally for validation text. merged with cronprocess's, .errorMessage
        __errorMessage: null,

        // system will flag watchers if they fail start validation. watchers with config errors
        // will not run (to save on error spam in logs), but will still be visible in dashboards
        __hasErrors: false,

        // users can add their own convenient name, if not this defaults to node name
        name : name,   

        //cronmask to time test - default is 1 minute
        interval : '*/1 * * * *',

        // internal test to call. must be in src/tests folder, must not have .js extension, egs `net.httpCheck`
        test: null,

        // string of user names to receive alerts on watcher status change. 
        // can be * to use all defined recipients
        // will be converted to string array
        // string array may be empty
        recipients : '*',

        // external command. either test or cmd must be given
        cmd: null,

        // enabled field is optional and true by default. setting this to false will cause the 
        // watcher to be completely ignored
        enabled : true,

    }, watcher)

    // remove if disabled
    if (!watcher.enabled){
        delete _settings.watchers[name]
        continue
    }

    allWatcherNames.push(name)

    // ensure user didn't force null on this
    watcher.recipients = watcher.recipients || '*' 
    // convert string list to array
    if (watcher.recipients !== '*')
        watcher.recipients = watcher.recipients.split(',').filter(w => !!w)

    // force default values based on logic  
    if (!watcher.cmd && !watcher.test)
        watcher.test = 'net.httpCheck'

    _settings.watchers[name] = watcher
}

// apply default dashboard settings
for (const dashboard in _settings.dashboards){

    _settings.dashboards[dashboard] = Object.assign({
        // node name, attached here for convenience
        __name : dashboard,  

        // nodename, made safe for filesystems
        __safeName : sanitize(dashboard), 

        // users can add their own convenient name, if not this defaults to node name
        name : dashboard,    

        enabled: true,

        // set to true to have this be the default dashboard when viewing '/' in a browser. if not set, the first
        // dashboard defined will be default. If multiple are defined with default, the first one defined is taken
        default : false,

        // force to all watchers
        watchers : '*'  
    }, _settings.dashboards[dashboard])

    // remove if disabled
    if (!_settings.dashboards[dashboard].enabled){
        delete _settings.dashboards[dashboard]
        continue
    }

    // if dashboard is set to * watchers, replace it's watchers list with literal names of all watchers
    if (_settings.dashboards[dashboard].watchers.trim() === '*'){
        if (allWatcherNames.length){
            console.debug(`assigning all watchers to dashboard "${dashboard}"`)
            _settings.dashboards[dashboard].watchers = allWatcherNames.join(',')
        } else {
            console.debug(`no watchers to assign to empty dashboard "${dashboard}"`)
            _settings.dashboards[dashboard].watchers = ''
        }
    }
}

// if a watcher has no explicit recipients list, assign all recipient names to list
const allRecipientNames = Object.keys(_settings.recipients).join(',')
for (const watcherName in _settings.watchers){
    const watcher = _settings.watchers[watcherName]

    // ensure value, user can force null
    watcher.recipients = watcher.recipients || '*'

    if (watcher.recipients === '*'){
        // replace with array of all recipients, or emty array
        if (allRecipientNames.length){
            watcher.recipients = allRecipientNames
            console.debug(`assigning all recipients "${allRecipientNames}" to watcher ${watcherName}`)
        } else {
            watcher.recipients = []
            console.warn(`WARNING : no default recipients to assign to contactless-watcher ${watcherName} - this watcher will fail silently`)
        }
    } else {

        // ensure that recipient names match objects in recipient object
        for (const recipientName of watcher.recipients)
            if (!_settings.recipients[recipientName])
                throw `Recipient name ${recipientName} in watcher ${watcherName} is invalid`
    }

    if (watcher.test && ! fs.existsSync(`${__dirname}/../tests/${watcher.test}.js`))
        throw `ERROR: watcher "${watcherName}" test "${watcher.test}" does not exist`

     _settings.watchers[watcherName] = watcher
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
if (!Object.keys(_settings.watchers).length)
    console.warn('No watchers were defined in settings file')

for (const name in _settings.watchers){
    const watcher = _settings.watchers[name]

    // todo : warn on multiple defaults
    exitIfNotSet(watcher.interval, `Watcher "${name}" has no interval`)
}

// parse environment variables
function processNode(node){
    for (let child in node)
        if (typeof node[child] === 'string')
            node[child] = parseEnvironmentVariables(node[child])
        else if (typeof node[child] === 'object' ) 
            processNode(node[child])
         else if (Array.isArray(node[child])) 
            for (item of node[child])
                processNode(item)
}

function parseEnvironmentVariables(value){

    const match = value.match(/{{env.(.*)}}/i)

    if (match){
        const value = match.pop()

        if (process.env[value])
            return process.env[value]
        else {
            throw `ERROR : config expects environment variable "${value}", but this was not found.`
        }
    }

    return value
}
processNode(_settings)

module.exports = _settings