# Settings

The `settings.yml` file is divided into three main sections

    transports:
        ...

    recipients:
        ...

    watchers:
        ....

## Transports

Transports are used to send alerts when watcher states change. 

### SMTP Transport 

You can send email using any SMTP server. AWD? uses simple user/password SMTP authenticaiton, and has been confirmed working with Amazon SES and MailGun. For example, to set up Mailgun as a transport, use

    transports:
        smtp:
            server : smtp.mailgun.org
            port : 587
            secure : false
            user : postmaster@<your-mailgun-account>.mailgun.org
            pass: your-mailgin-password
            from : me@example.com

With that out of the way, it should be said that SMTP is really simple to set up if you're doing everything
exactly right, and difficult to diagnose the instant something goes wrong. If you're struggling with settings 
to work, first test them independently with a simple SMTP client like `swaks`:

        sudo apt install swaks -y

        ./swaks --auth \
            --server smtp.some-service.com \
            --au postmaster@YOUR_DOMAIN_NAME \
            --ap your-password \
            --to bar@example.com \
            --h-Subject: "Hello world" \
            --body 'Testing send you some mail'

If that works, AWD? has its own STMP test that sends your a mail directly. Use it with

        curl http://yourAWDserver/diagnostics/transport/smtp/<recipient-node>

where `recipient-node` is the recipient node in AWD's config with an `smtp:email-address` child property on it.

### Slack Transport

Alerts can be sent to a Slack user or a Slack Channel. 

- Your Slack app needs four scopes, `channels:read, groups:read, mpim:read, im:read, chat:write`. To post to channels you also need to manually add your
  app to the channel in question, via the Slack app.
- Secret is also called "Signing Secret" is specific to your Slack app.
- Token normally starts with `xox` and is specific to your app's integration into your workspace.

        transports:
            slack:
                secret: ...............
                token: xoxb-...........

## Recipients

Recipients are people or systems that receive alerts. 

### SMTP

To receive emails add `smtp` to a recipient and add email address to it

    recipients:
        BobMcName:
            smtp: bob@example.com

### Slack 

To receive slack alerts add `slack` to a recipient and define either a slack user id or channel id.

    recipients:
        BobMcName:
            slack: user/channelId

To get a user id, click on the user profile in the Slack desktop client, then look under "More". To find a channel id, open Slack in a browser and click on the channel you want to post to - the channel id is the second id in browser address bar https://app.slack.com/client/workspace-id/channel-id/user_profile/your-own-user-id

## Watchers

Watchers let you test something at regular intervals. The following built-in tests are available.

### HTTP 200

The simplest (and default) watcher is the HTTP check. It queries a host and fails if it doesn't get an HTTP code 200 back. You can specify another HTTP code if you expect something other than 200 (such as a `403` if the host prompts you to login).

    watchers:
        mytest:
            host: example.com

            # optional code if you're expecting something other than 2xx
            code : 403 

### Port open

Test if a port at the given host is open. Works on TCP only.

    watchers:
        port:
            test: net.portOpen
            host: 192.168.1.126
            port: 8006

### Jenkins job status

Test if a jenkins job is passing. Requires a Jenkins server URL and job name.

- Host can be any URL that gives access to the server, this is often with built-in credentials. 
- Job name can be the human-friendly version, we'll make it URL-safe, so copy this directly from your Jenkins UI if you want.
- By default, a test passes on success only, all other outcomes will be read as failure. You can override this with `status` value, which can be a comma-separated string consisting of `success`, `aborted` and/or `failure` (these strings are taken directly from the Jenkins API).

        watchers:
            my_jenkins_job:
                test : jenkins.buildSuccess
                host: <USER>:<PASSWORD>@example.com
                job: My Jenkins Job

                # Optional.
                status: success,aborted 

### Docker container up

If your have the Docker [HTTP API](https://docs.docker.com/engine/api/v1.24/) enabled, you can query it to test if a container is up on a given docker host. 

    watchers:
        my-container-test:
            test: docker.containerIsUp
            host: example.com
            container: myContainer # container name

            # Optional. Port to query, the default is 2375.
            port: 2375 

### System.d service running

You can test if a system.d service is running. You will need SSH access to the machine running the service. Password can be templated in via an env var ([see advanced settings](#Secrets)).

    watchers:
        my-service-test:
            test: systemd.servicerunning
            host: example.com
            user: myuser
            password: mypassword

            # name of the system.d service to query
            service: docker

### Disk use 

You can check if a disk is runnnig out of space (Linux only). You will need SSH access to the machine running the service. Password can be templated in via an env var ([see advanced settings](#Secrets)).

    watchers:
        my-disk-use-test:
            test: resource.linux.diskUse
            host: example.com
            user: myuser
            password: mypassword
            path: /some/path/on/host

            # max % use allowed
            threshold: 50

### Ping

You can ping a host. 

- Timeout is in seconds, and is optional. 

        watchers:
            my-ping-test:
                test: net.ping
                host: example.com

                # optional
                timeout: 10 

### ZFS Pool Status

You can query the status of a ZFS pool on a host. This test ensures that the pool's `state` is `online`. You will need SSH access to the machine running the service. Password can be templated in via an env var ([see advanced settings](#Secrets)).

    watchers:
        is-my-data-gone:
            test: filesystem.zfs.zpoolStatus
            host: example.com
            user: myuser
            password: mypassword

            # name of zfs pool to check
            pool: mypoolname
                
### Date In File

You can rig up a simple "dead man's switch" by writing a date to a file at the end of some process. As long as the date in the file is current, the test will pass. The date written must be in Javascript-parsable ISO format. You can generate a file in a Linux terminal with the command

    echo $(date --iso-8601=seconds) >> /path/to/datefile

You will need SSH access to the machine running the service. Password can be templated in via an env var ([see advanced settings](#Secrets)).

    watchers:
        is-my-process-alive:
            test: general.dateInFile
            host: example.com
            user: myuser
            password: mypassword

            # path on remote machine date is written to
            path: /path/to/datefile

            # Maximum allowed age of date in file. Can be any digit followed by S, M, H or D (seconds, minutes, hours or days, case not important)
            range: 24H

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

    # defines where logs are written. Default value is relative to application startup path. If you want to 
    # write to /var/log/arewedown for example, change this
    logs: ./logs

    # Port HTTP server run ons   
    port: 3000

    # Interval for dashboard refreshes (milliseconds)
    dashboardRefreshInterval: 5000,

    # Interval for dashboard timeout (milliseconds)
    dashboardLoadTimeout: 5000,

    # Allows app to exit with an HTTP call. This is useful if you're changing configuration in settings.yml and
    # don't want to restart the Docker/daemon process the app runs in
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
