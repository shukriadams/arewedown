let _settings = null,
    _override = null

module.exports = {

    /**
     * Explicitly crash app if a value is null or not defined - zero and empty strings must be allowed
     */
    failIfNotSet(value, message){
        if (value === null || value === undefined)
            throw message
    },

    parseEnvironmentVariables(value){
        
        const process = require('process'),
            match = value.match(/{{env.(.*)}}/i)
    
        if (match){
            const value = match.pop()
    
            if (process.env[value])
                return process.env[value]
            else {
                throw `ERROR : config expects environment variable "${value}", but this was not found.`
            }
        }
    
        return value
    },

    /**
     * parse environment variables
     */
    processNode(node){
        for (let child in node)
            if (typeof node[child] === 'string')
                node[child] = this.parseEnvironmentVariables(node[child])
            else if (typeof node[child] === 'object' ) 
                this.processNode(node[child])
            else if (Array.isArray(node[child])) 
                for (item of node[child])
                    this.processNode(item)
    },

    load(){
        let fs = require('fs-extra'),
            yaml = require('js-yaml'),
            process = require('process'),
            dotenv = require('dotenv'),
            sanitize = require('sanitize-filename'),
            allWatcherNames = [],
            settingsPath = './config/settings.yml'

        _settings = {}

        // apply env vars from optional .env file in project root
        dotenv.config()
        
        // this is used to allow dev settings that will not be committed to source control
        if (fs.existsSync('./config/settings.dev.yml'))
            settingsPath = './config/settings.dev.yml'
        
        if (fs.existsSync(settingsPath))
            try {
                let settingsYML = fs.readFileSync(settingsPath, 'utf8')
                _settings = yaml.safeLoad(settingsYML)
            } catch (e) {
                console.log('Error reading settings.yml', e)
                throw e
            }
        else 
            console.warn(`WARNING: settings.yml not found - please create file "<AreWeDown root folder>/config/settings.yml". If you are running in docker, mount your config volume folder to "/etc/arewdown/config" and ensure you have settings.yml in that folder.`)
        
        
        // default settings
        _settings = Object.assign({
        
            // override default title
            header: 'Are We Down?',
        
            // path all log data is written to. This folder is in the AWD? root folder.
            logs : './logs',

            // can be error|warn|info|debug in increasing levels of spamminess.
            logLevel: 'warn',

            // port AWD? listens on.
            port: 3000,
        
            // milliseconds dashboard reloads itself
            dashboardRefreshInterval: 5000,
        
            // milliseconds for dashboard to timeout and show self-error
            dashboardLoadTimeout: 5000,
        
            // allows AWD to exit (and cleanly restart when daemonized) via HTTP call. Enable only if you trust people
            // on your network not to abuse
            allowHttpExit: false,
        
            // internal worker timer, cleans up/self-maintains. Should run once a day only
            internalWorkerTimer : '0 0 * * *',
        
            // in days. set to zero to disable.
            logRetention: 365, 
            
            // root-level objects
            dashboards : {},
            recipients : {},
            transports : {},
            watchers : {},
        
            // DEVELOPMENT STUFF - you will likely never have to change these
        
            // set to false when developing for views to rebuild on each page reload
            cacheViews : true

        }, _settings)
        
        // it's still possible to nullify these with goofy setup.yml content, so force exist as we rely on them being present
        _settings.dashboards = _settings.dashboards || {}
        _settings.recipients = _settings.recipients || {}
        _settings.transports = _settings.transports || {}
        _settings.watchers = _settings.watchers || {}

        // ensure that "default" dashboard is defined if no dashboards set
        if (!Object.keys(_settings.dashboards).length)
            _settings.dashboards['default'] = { name : '' }
        
        // apply default recipient settings
        for (const recipient in _settings.recipients){
        
            _settings.recipients[recipient] = Object.assign({
                enabled : true
            }, _settings.recipients[recipient])
        
            // remove if disabled
            if (!_settings.recipients[recipient].enabled)
                delete _settings.recipients[recipient]
        }
        
        // apply default transport settings
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
                
                // this is the parent node's name repeated
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
            this.failIfNotSet(_settings.transports.smtp.server, 'settings "transports.smtp" is missing expected value ".server"')
            this.failIfNotSet(_settings.transports.smtp.port, 'settings "transports.smtp" is missing expected value ".port"')
            this.failIfNotSet(_settings.transports.smtp.secure, 'settings "transports.smtp" is missing expected value ".secure"')
            this.failIfNotSet(_settings.transports.smtp.user, 'settings "transports.smtp" is missing expected value ".user"')
            this.failIfNotSet(_settings.transports.smtp.pass, 'settings "transports.smtp" is missing expected value ".pass"')
            this.failIfNotSet(_settings.transports.smtp.from, 'settings "transports.smtp" is missing expected value ".from"')
        }
        
        // validate watchers
        if (!Object.keys(_settings.watchers).length)
            console.warn('No watchers were defined in settings file')
        
        for (const name in _settings.watchers){
            const watcher = _settings.watchers[name]
        
            // todo : warn on multiple defaults
            this.failIfNotSet(watcher.interval, `Watcher "${name}" has no interval`)
        }
        
        this.processNode(_settings)
    },
    
    /**
     * For testing only - allows easy override of app settings
     */
    override(override){
        if (!_settings)
            this.load()

        _override = Object.assign(JSON.parse(JSON.stringify(_settings)), override)
    },

    /**
     * For testing only
     */
    revert(){
        _override = null
    },


    get(){
        if (_override)
            return _override

        if (!_settings)
            this.load()
        
        return _settings
    }
}
