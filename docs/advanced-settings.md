# Advanced Settings

## Defaults

*AreWeDown?* works out of the box with no cutom settings. You can override the defaults with the following. Note that these settings are passed in as standard environment variables, you can define them any way you want. They can be written either at the root level of _settings.yml_ file or in your _docker-compose.yml_'s `environment:` section. 

    // override default title
    header: 'Are We Down?'

    # defines where logs are written. Default value is relative to application startup path
    logs: './logs'

    # Port HTTP server run ons   
    port: 3000

    // Interval dashboard refreshes (milliseconds)
    dashboardRefreshInterval: 5000,

    // Interval for dashboard timeout (milliseconds)
    dashboardLoadTimeout: 5000,

    // Allows app to exit with an HTTP call. This is useful if you're changing configuration in settings.yml and don't want to restart the Docker/daemon process the app runs in
    // If properly daemonized your app will restart instantly and with updated settings applied.
    allowHttpExit: false

    // Amount of data logged. Can be error, warn, info
    logLevel: 'warn'

    // internal work cleans up/maintains self. needs to run once a day only.
    internalWorkerTimer : '0 0 * * *'

    // In days. AreWeDown? can clean up its own log data to prevent your disk from flooding.
    logRetention: 365 

Documentation can sometimes go out of sync with code - check [settings.js](https://github.com/shukriadams/arewedown/blob/master/src/lib/settings.js) to be sure.

## Logs

*AreWeDown?* logs, a lot. It writes its own logs to the `/etc/arewedown/logs/<DATE>.log`, and then for each watcher in `/etc/arewedown/logs/<WATCHER>/logs/<DATE>.log`. Use `docker logs arewdown` to quickly see recent log entries.        