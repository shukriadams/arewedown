# Settings

The `settings.yml` file is divided into three main sections

    transports:
        ...

    recipients:
        ...

    watchers:
        ....

## Transports

Transports are used to send out alerts when watcher states change. 

### SMTP Transport 

You can send email using any SMTP server. To use a Gmail account try

    transports:
        smtp:
            server : smtp.gmail.com
            port : 465
            secure : true
            user : your-user@gmail.com
            pass: your-gmail-password
            from : your-user@gmail.com

### Slack Transport

Alerts can be sent to a Slack user or a Slack Channel. 

- Your Slack app needs four scopes, `channels:read, groups:read, mpim:read, im:read`. 
- Secret is also called "Signing Secret" is specific to your Slack app.
- Token normally starts with `xox` and is specific to your app's integration into your workspace.

        transports:
            slack:
                secret: ...............
                token: xoxb-...........

## Recipients

Recipients are people or systems that receive alerts. 

### SMTP

To send alerts using the `smtp` transport use

    recipients:
        BobMcName:
            smtp: bob@example.com

### Slack 

To send alerts using the `slack` transport use

    recipients:
        BobMcName:
            slack: user/channelId

Either a user or channel ID can be targeted. To get a user id, click on the user profile in the Slack desktop client, then look under "More". To find a channel id, open Slack in a browser and click on the channel you want to post to - the channel id is the second id in browser address bar https://app.slack.com/client/<workspace-id>/<channel-id>/user_profile/<your-own-user-id>

## Watchers

The following built-in tests are available.

### HTTP 200 Test

The simplest and default watcher is the HTTP check. It queries a URL and fails if it doesn't get a HTTP code of  200. You can specify an expected code if the URL you're calling "passes" with an error code. f.ex a `403` error (login required) can still indicate that a service is up.

    watchers:
        mytest:
            host: http://example.com

            # optional code if you're expecting something other than 2xx
            code : 403 

### Port open Test

Tests if a port at the given address is open. Works on TCP only.

    watchers:
        port:
            test: net.portOpen
            host: 192.168.1.126
            port: 8006

### Jenkins job status Test

Test if a jenkins job is passing. Requires Jenkins server URL and job name.

- Host can be any URL that gives access to the server, this is often with built-in credentials. 
- Job name can be the human-friendly version, we'll make it URL-safe, so copy this directly from your Jenkins UI if you want.
- By default, a test passes on success only, all other outcomes will be read as failure. You can override this with `status` value, which can be a comma-separated string consisting of  `success`, `aborted` and/or `failure`. These are taken directly from the Jenkins API.

        watchers:
            my_jenkins_job:
                test : jenkins.buildSuccess
                host: http://<USER>:<PASSWORD>@example.com
                job: My Jenkins Job

                # Optional.
                status: success,aborted 

### Docker container up

If your have the Docker [HTTP API](https://docs.docker.com/engine/api/v1.24/) enabled, you can query it to test if a container is up on a given host. 

    watchers:
        my-container-test:
            test: docker.containerIsUp
            host: http://example.com
            container: myContainer # container name

            # Optional. Port to query, the default is 2375.
            port: 2375 

### System.d service running

You can test if a system.d service is running - you need SSH access to the machine running the service. For the security conscious, password can be templated in via an env var ([see advanced settings](#Secrets))

    watchers:
        my-service-test:
            test: systemd.servicerunning
            host: example.com
            user: myuser
            password: mypassword
            service: docker

### Ping

You can ping a host. 

- Timeout is in seconds, and is optional. 

        watchers:
            my-ping-test:
                test: net.ping
                host: 192.168.0.1

                # optional
                timeout: 10 

### Default watcher behaviour

- Watchers have a default interval of 1 minute. You can override any watcher's default with any valid cronmask (masks must be in quotes, this is a YML quirk).
- The YML node is the default name of a watcher. You can provide a display name using the optional `name` field.
- Watchers, like most other objects in *AreWeDown?* have an optional `enabled` field that defaults to true. Set this to false to disable the watcher.
- To alert specific people about a watcher failure, use `recipients` - this is an optional, comma-separated list of names defined under the top-level `recipients` section. If left empty, all recipients will receive alerts for that watcher.

        watchers:
            mytest:
                
                # Give it a fancier name with spaces and things
                name: my "fancy" test name!

                # Send alerts to these people only. Sane spacing optional (Python trigger warning)
                recipients: BobMcName,someOtherPerson,      YetAnotherPerson            

                # Run it on a Tuesday only, because.
                interval: '0 0 * * TUE'
                                
                # Actually, don't run it at all.
                enabled: false

## Custom tests

You can write your own tests in any shell script supported by your host system. See [custom tests](/custom-tests.md) for more.

## Advanced Settings

### Defaults

The following overridable default settings live in the root-level of settings.yml.

    # default dashboard title 
    header: Are We Down?

    # defines where logs are written. Default value is relative to application startup path. If you want to write to /var/log/arewedown for example, change this
    logs: ./logs

    # Port HTTP server run ons   
    port: 3000

    # Interval for dashboard refreshes (milliseconds)
    dashboardRefreshInterval: 5000,

    # Interval for dashboard timeout (milliseconds)
    dashboardLoadTimeout: 5000,

    # Allows app to exit with an HTTP call. This is useful if you're changing configuration in settings.yml and don't want to restart the Docker/daemon process the app runs in
    # If properly daemonized your app will restart instantly and with updated settings applied.
    allowHttpExit: false

    # Amount of data logged. Can be error, warn, info
    logLevel: warn

    # internal work cleans up/maintains self. needs to run once a day only. Must be wrapped in quotes.
    internalWorkerTimer : '0 0 * * *'

    # In days. AreWeDown? can clean up its own log data to prevent your disk from flooding.
    logRetention: 365 

### Secrets

If you do not want to store sensitive information like passwords in the `settings.yml` file, you can pass these as environment variables from your host system, and bind them anywhere in settings with the `"{{env.___}}"` template pattern

    anyProperty: "{{env.MY_SENSITIVE_INFO}}"

If you defined an environment variable `MY_SENSITIVE_INFO=1234`, the `anyProperty` setting have the value `1234` in memory. If a templated environment variable is not found, *AreWeDown?* will fail to start.

### Logs

*AreWeDown?* logs, a lot. It writes its own logs to the `/etc/arewedown/logs/<DATE>.log`, and then for each watcher in `/etc/arewedown/logs/<WATCHER>/logs/<DATE>.log`. If *AreWeDown?* fails to start or exits abruptly, a good place to start looking is its logs.