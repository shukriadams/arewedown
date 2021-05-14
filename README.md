# Are We Down?

![Screenshot of AreWeDown?](https://github.com/shukriadams/arewedown/blob/master/screenshot.PNG)

*Are We Down?* is a simple uptime monitoring system and dashboard. It is intended for the home/self-hosting user who runs multiple services/networked devices on a private LAN, and who doesn't want the hassle of setting up a complex enterprise-level monitoring system. It is written in NodeJS.

## Features 

- Simple to setup and use. All configuration stored in a single YML file. No clunky databases, no dependencies on other services like Influx or Prometheus. 
- Tests HTTP status, along with a growing list of other useful queries.
- Sends alerts via email (SMTP), Slack and others coming.
- Can be extended with your own test scripts using shell scripts, Javascript (NodeJS) or Python3 scripts.
- Runs on x86 and ARM (Docker containers are built for both) 
- Runs on low-spec hardware like the Raspberry Pi 3.
- Built-in dashboard will run on almost any browser, ideal for a Raspberry Pi in kiosk mode. 

*NOTE:*

- Never expose *Are We Down?* to the public internet - use it behind a firewall/router at all times! 
- *Are We Down?* is currently not supported or tested on Windows.

## Install

If you're on Linux (including Raspbian) and have Docker installed, check out the [Docker installation guide](/docs/install-docker.md).

If you're on Linux x64 and don't want to use Docker, you can grab a standalone executable under [releases](https://github.com/shukriadams/arewedown/releases). (These are still experimental).

If you want to install the app from source, try the [NodeJS install guide](/docs/install-nodejs.md).

## Config

For complete settings, check the [advanced settings guide](/docs/advanced-settings.md).


`Settings.yml` Is divided up into 3 main sections. 

    transmissions:
        ...

    recipients:
        ...

    watchers:
        ....

### Transmissions

Transmissions are used to send out alerts when watcher states change. Tranmissions are tested and logged automatically when *AreWeDown?* starts, so check logs to ensure your settings work.

#### SMTP

You can send email using any SMTP server. To use a Gmail account try

    transmissions:
        smtp:
            server : smtp.gmail.com
            port : 465
            secure : true
            user : your-user@gmail.com
            pass: your-gmail-password
            from : your-user@gmail.com

### Recipients

Recipients are people who receive alerts. To send alerts using the `smtp` transport use

    recipients:
        BobMcName:
            smtp: bob@example.com
        FaceFacersson:
            smtp: face@example.com

### Watchers

Watchers watch things to see if they are passing or failing. 

#### Default watcher settings

- Watchers have a default interval of 1 minute. You can override any watcher's default with any valid cronmask.
- YML imposes restrictions on the name of a node. You can override the displayed name of a watcher by setting its optional `name` field.
- Watchers, like most other objects in *AreWeDown?* have an optional `enabled` field that defaulst to true. Set this to false to disable the watcher.
- To alert specific people about a watcher failure, use the `recipients` property. This is an optional, comma-separated list of names defined in under `recipients`. If left empty, all defined recipients will receive alerts for the watcher.

        watchers:
            mytest:
                name : my optional name
                interval: '0 0 * * TUE'
                enabled: false
                recipients: BobMcName,someOtherPerson,YetAnotherPerson

#### Watcher tests

There are several built-in tests such as

- HTTP 200 watcher
- TCP Port open
- Docker container up
- Jenkins job passing

Check the [built-in tests guide](/docs/built-in-tests.md) for details on how to configure these.

You can also write tests in bash, NodeJS or Python3 if you're more into that sort of thing. There's [a guide for custom code tests](/docs/custom-tests.md) too.

## Interested in contributing?

Please check [contributing](/docs/contributing.md).
