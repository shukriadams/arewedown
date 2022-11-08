let _settings = null

module.exports = {

    /**
     * Explicitly crash app if a value is null or not defined - zero and empty strings must be allowed
     */
    failIfNotSet(value, message) {
        if (value === null || value === undefined)
            throw message
    },


    /**
     * Checks a setting value for "{{env.<VALUE>}}" content, if found, replaces entire value with the environment variable named <VALUE>. Use this
     * to store sensitive information like passwords in env variables instead of in settings.yml
     * @param {string} value
     */
    replaceTemplatedEnvVars(value) {

        const process = require('process'),
            match = value.match(/{{env.(.*)}}/i)

        if (match) {
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
     *
     */
    searchAndReplaceTemplatedEnvVars(node) {
        for (let child in node)
            if (typeof node[child] === 'string')
                node[child] = this.replaceTemplatedEnvVars(node[child])
            // always handle arrays before objects, as arrays are also objects in JS
            else if (Array.isArray(node[child]))
                for (item of node[child])
                    this.searchAndReplaceTemplatedEnvVars(item)
            else if (typeof node[child] === 'object')
                this.searchAndReplaceTemplatedEnvVars(node[child])
    },


    /**
     * Loads settings from yml file and various env var sources. Also validates settings after load - app can be forced to exit
     * in event of serious misconfiguration.
     *
     * @param {object} forcedIncomingSettings Used by testing only
     */
    load(forcedIncomingSettings = null) {
        let fs = require('fs-extra'),
            process = require('process'),
            yaml = require('js-yaml'),
            dotenv = require('dotenv'),
            sanitize = require('sanitize-filename'),
            allWatcherNames = [],
            disabledRecipients = [],
            settingsPath = process.env.AWD_SETTINGS_PATH || './config/settings.yml' // allow settings path to be passed in

        // apply env vars from optional .env file in project root
        dotenv.config()

        // allow local dev settings to override all
        if (fs.existsSync('./config/settings.dev.yml'))
            /* istanbul ignore next */
            /* this line is extremely difficult to cover when building from github, and so edge-case, that it's best ignored */
            settingsPath = './config/settings.dev.yml'

        if (fs.existsSync(settingsPath))
            try {
                let settingsYML = fs.readFileSync(settingsPath, 'utf8')
                _settings = yaml.safeLoad(settingsYML)
            } catch (e) {
                console.log('Error reading settings.yml', e)
                throw e
            }
        else {
            console.warn(`!! Warning: settings.yml not found - please create it at "<AreWeDown? root folder>/config/settings.yml".`)
            console.warn(`!! If you are running in docker, confirm your volume mounts.`)
        }

        // allow forcedIncomingSettings to override all settings load from file
        _settings = forcedIncomingSettings || _settings

        // default settings
        _settings = Object.assign({

            // override default title
            header: 'Are We Down?',

            // rooth path
            rootpath: '/',

            // path all log data is written to. This folder is in the AWD? root folder.
            logs: './logs',

            // can be error|warn|info|debug in increasing levels of spamminess.
            logLevel: 'warn',

            // port AWD? listens on.
            port: 3000,

            // autoassigned protocol if none is given
            defaultTestProtocol: 'http',

            // milliseconds dashboard reloads itself
            dashboardRefreshInterval: 5000,

            // milliseconds for dashboard to timeout and show self-error
            dashboardLoadTimeout: 5000,

            // allows AWD to exit (and cleanly restart when daemonized) via HTTP call. Enable only if you trust people
            // on your network not to abuse
            allowHttpExit: false,

            // internal worker timer, cleans up/self-maintains. Should run once a day only
            internalWorkerTimer: '0 0 * * *',

            // in days. set to zero to disable.
            logRetention: 365,

            // root-level objects
            dashboards: {},
            recipients: {},
            transports: {},
            watchers: {},

            // DEVELOPMENT STUFF - you will likely never have to change these

            // set to false when developing for views to rebuild on each page reload
            cacheViews: true

        }, _settings)

        if (!_settings.rootpath.endsWith("/")) {
            _settings.rootpath += "/"
        }

        // it's still possible to nullify these with goofy setup.yml content, so force exist as we rely on them being present
        _settings.dashboards = _settings.dashboards || {}
        _settings.recipients = _settings.recipients || {}
        _settings.transports = _settings.transports || {}
        _settings.watchers = _settings.watchers || {}

        // ensure that "default" dashboard is defined if no dashboards set
        if (!Object.keys(_settings.dashboards).length)
            _settings.dashboards['default'] = {name: ''}

        // apply default recipient settings
        for (const recipient in _settings.recipients) {

            _settings.recipients[recipient] = Object.assign({
                enabled: true
            }, _settings.recipients[recipient])

            // remove if disabled
            if (!_settings.recipients[recipient].enabled) {
                disabledRecipients.push(recipient)
                delete _settings.recipients[recipient]
            }
        }

        // apply default transport settings
        for (const transport in _settings.transports) {
            _settings.transports[transport] = Object.assign({
                enabled: true
            }, _settings.transports[transport])

            // remove if disabled
            if (!_settings.transports[transport].enabled)
                delete _settings.transports[transport]
        }

        // apply default watcher settings
        for (const name in _settings.watchers) {
            let watcher = _settings.watchers[name]

            // apply default watcher settings
            watcher = Object.assign({

                // this is the parent node's name repeated
                __name: name,

                __safeName: sanitize(name),

                // internally set error message. normally for validation text. merged with cronprocess's, .errorMessage
                __errorMessage: null,

                // system will flag watchers if they fail start validation. watchers with config errors
                // will not run (to save on error spam in logs), but will still be visible in dashboards
                __hasErrors: false,

                // users can add their own convenient name, if not this defaults to node name
                name: name,

                //cronmask to time test - default is 1 minute
                interval: '*/1 * * * *',

                // internal test to call. must be in src/tests folder, must not have .js extension, egs `net.httpCheck`
                test: null,

                // string of user names to receive alerts on watcher status change. 
                // can be * to use all defined recipients
                // is converted to string array
                recipients: '*',

                // external command. either test or cmd must be given
                cmd: null,

                // enabled field is optional and true by default. setting this to false will cause the 
                // watcher to be completely ignored
                enabled: true,

            }, watcher)

            // remove if disabled
            if (!watcher.enabled) {
                delete _settings.watchers[name]
                continue
            }

            allWatcherNames.push(name)

            // ensure user didn't force null on this, from here on we assume this value is set
            watcher.recipients = watcher.recipients || '*'

            // force default values based on logic  
            if (!watcher.cmd && !watcher.test)
                watcher.test = 'net.httpCheck'

            _settings.watchers[name] = watcher
        }

        // apply default dashboard settings
        for (const dashboard in _settings.dashboards) {

            _settings.dashboards[dashboard] = Object.assign({
                // node name, attached here for convenience
                __name: dashboard,

                // nodename, made safe for filesystems
                __safeName: sanitize(dashboard),

                // users can add their own convenient name, if not this defaults to node name
                name: dashboard,

                enabled: true,

                // set to true to have this be the default dashboard when viewing '/' in a browser. if not set, the first
                // dashboard defined will be default. If multiple are defined with default, the first one defined is taken
                default: false,

                // force to all watchers
                watchers: '*'
            }, _settings.dashboards[dashboard])

            // remove if disabled
            if (!_settings.dashboards[dashboard].enabled) {
                delete _settings.dashboards[dashboard]
                continue
            }

            // if dashboard is set to * watchers, replace it's watchers list with literal names of all watchers
            if (_settings.dashboards[dashboard].watchers.trim() === '*') {
                if (allWatcherNames.length) {
                    console.debug(`assigning all watchers to dashboard "${dashboard}"`)
                    _settings.dashboards[dashboard].watchers = allWatcherNames.join(',')
                } else {
                    console.debug(`!! No watchers to assign to empty dashboard "${dashboard}".`)
                    _settings.dashboards[dashboard].watchers = ''
                }
            }
        }

        // if a watcher has no explicit recipients list, assign all recipient names to list
        const allRecipientNames = Object.keys(_settings.recipients)
        for (const watcherName in _settings.watchers) {
            const watcher = _settings.watchers[watcherName]

            if (watcher.recipients === '*') {
                // replace with array of all recipients, or emty array
                if (allRecipientNames.length) {
                    watcher.recipients = allRecipientNames
                    console.debug(`assigning all recipients "${allRecipientNames.join(',')}" to watcher ${watcherName}`)
                } else {
                    watcher.recipients = []
                    console.warn(`WARNING : no default recipients to assign to contactless-watcher ${watcherName} - this watcher will fail silently`)
                }
            } else {
                // convert string list to array if string is not * (if * will be handled later)
                watcher.recipients = watcher.recipients
                    .split(',')
                    .map(w => w ? w.trim() : w)
                    .filter(w => !!w)
            }

            // remove disabled watchers
            watcher.recipients = watcher.recipients.filter(r => !disabledRecipients.includes(r))

            // ensure that recipient names exist in global recipient list
            for (const recipientName of watcher.recipients)
                if (!_settings.recipients[recipientName])
                    throw `Recipient name ${recipientName} in watcher ${watcherName} is not defined under global recipients.`

            // ensure test exists - we cannot verify cmd as that's entirely up to user, and must fail at watcher execute level
            if (watcher.test && !fs.existsSync(`${__dirname}/../tests/${watcher.test}.js`))
                throw `ERROR: watcher "${watcherName}" specifies non-existent test "${watcher.test}".`

            _settings.watchers[watcherName] = watcher
        }

        // validate SMTP if enabled
        if (_settings.transports.smtp && _settings.transports.smtp.enabled) {
            this.failIfNotSet(_settings.transports.smtp.server, 'settings "transports.smtp" is missing expected value ".server"')
            this.failIfNotSet(_settings.transports.smtp.port, 'settings "transports.smtp" is missing expected value ".port"')
            this.failIfNotSet(_settings.transports.smtp.secure, 'settings "transports.smtp" is missing expected value ".secure"')
            this.failIfNotSet(_settings.transports.smtp.user, 'settings "transports.smtp" is missing expected value ".user"')
            this.failIfNotSet(_settings.transports.smtp.pass, 'settings "transports.smtp" is missing expected value ".pass"')
            this.failIfNotSet(_settings.transports.smtp.from, 'settings "transports.smtp" is missing expected value ".from"')
        }

        // validate slack settings if enabled
        if (_settings.transports.slack && _settings.transports.slack.enabled) {
            this.failIfNotSet(_settings.transports.slack.token, 'settings "transports.slack" is missing expected value ".token"')
            this.failIfNotSet(_settings.transports.slack.secret, 'settings "transports.slack" is missing expected value ".secret"')
        }


        // validate watchers
        if (!Object.keys(_settings.watchers).length)
            console.warn('!! No watchers were defined in settings file.')

        for (const name in _settings.watchers) {
            const watcher = _settings.watchers[name]

            // todo : warn on multiple defaults
            this.failIfNotSet(watcher.interval, `Watcher "${name}" has no interval`)
        }


        this.searchAndReplaceTemplatedEnvVars(_settings)


    },


    /**
     *
     */
    reset() {
        _settings = null
    },


    get() {
        if (!_settings)
            this.load()

        return _settings
    }
}
