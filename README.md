# Are We Down?

![Screenshot of AreWeDown?](https://github.com/shukriadams/arewedown/blob/master/screenshot.PNG)

*Are We Down?* is a simple uptime monitoring system and dashboard. It is intended for the home or small business user who runs multiple services/networked devices on a private LAN, and who doesn't want the hassle of setting up a complex enterprise-level monitoring system. 

## Features 

- Simple to setup and use. All configuration stored in YML. No clunky databases, no dependencies on other services like Influx or Prometheus. 
- Supports HTTP status checking service.
- Sends alerts via email (SMTP), Slack and others coming.
- Can be extended with your own test scripts using shell scripts, Javascript (NodeJS) or Python3 scripts.
- Runs on x86 and ARM (Docker containers are built for both) 
- Runs on low-spec hardware like the Raspberry Pi 3.
- Built-in dashboard will run on almost any browser on low-spec device, ideal for older Raspberry Pi's in kiosk mode. 

*Please note :*

- Never expose *Are We Down?* to the public internet - use it behind a firewall/router at all times! 
- *Are We Down?* is not supported or tested on Windows.

## Setup in Docker

Docker images are available @ https://hub.docker.com/r/shukriadams/arewedown. Find an up-to-date tag there (this project does not build `:latest`). If you intend to run on a Pi, use `<TAG>-arm`

- An example docker-compose.yml is

        version: "2"
        services:
        arewedown:
            image: shukriadams/arewedown:<TAG-HERE>
            container_name: arewedown
            restart: unless-stopped
            volumes:
            - ./config:/etc/arewedown/config
            - ./logs:/etc/arewedown/logs/:rw
            # - ./scripts:/etc/arewedown/custom-tests # optional, see "custom tests" section of documentation
            ports:
            - "3000:3000"

- Two directory volume mounts are required, one for logs, the other for config.
    - Ensure write access to the `logs` directory, the container runs with user id 1000, use `chown -R 1000 path/to/logs` to enable writes, or the app will fail.
    - Create an empty `settings.yml` file in the config directory, this is where all application settings live.

## Config

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

#### Slack

Coming soon ...

### Recipients

Recipients are people who receive alerts. To send alerts using the `smtp` transport use

    recipients:
        BobMcName:
            smtp: bob@example.com
        FaceFacersson:
            smtp: face@example.com

### Watchers

Watchers watch things to see if they are passing or failing.

#### HTTP 200 Test

The simplest and default watcher is the HTTP check. It requests a URL and fails if it doesn't get a response between 200 and 299.

    watchers:
        mytest:
            url: http://example.com

*AreWeDown?* has several built-in tests ([all tests](https://github.com/shukriadams/arewedown/tree/master/src/tests))

#### Port open Test

Tests if a port at the given address is open. Works on TCP only.

    watchers:
        port:
            test: net.portOpen
            host: 192.168.1.126
            port: 8006

#### Jenkins job status Test

Test if a jenkins job is passing. Requires Jenkins server URL and the name of the job in jenkins. 

- URL can be any URL that gives access to the server, this is often with built-in credentials. 
- Job name can be the human-friendly version, we'll make it URL-safe.
- Test passes on success only, all other outcomes will be read as a failure. 

          watchers:
                my_jenkins_job:
                    test : jenkins.buildSuccess
                    url: http://<USER>:<PASSWORD>@<JENKSINSURL>
                    job: <JENKINS JOB NAME>

#### Custom tests

*AreWeDown?* also supports calling shell scripts for tests. For example, you can write your tests directly in `settings.yml`. To test if NFS is running at a remote, you can use

    watchers:
         nfs-test:
            cmd : /usr/bin/rpcinfo -u <MY-SERVER-IP> mountd | grep "ready and waiting"

You can also call your own Python, Bash or NodeJS scripts. In the docker-compose example above we mounted a directory to `/etc/arewedown/custom-tests` in our container. If you put the a Python script in that folder 

    import sys
    # parse arg --foo, do some test, if fails exit with code 1, else code 0
    sys.exit(1)

Then call it

    watchers:
         my-custom-test:
            cmd : python3 /etc/arewedown/custom-tests/mytest.py --foo bar

You can do the same with NodeJS, Bash or anything linux-supported script

    watchers:
         my-custom-test:
            cmd : node /etc/arewedown/custom-tests/mytest.js --foo bar

If your script requires external dependencies or setup, use `onstart` to fire a shell command.

    onstart: cd /etc/arewedown/custom-tests && npm install && sudo apt-get install <some-package> -y
    watchers:
        ...

#### Default settings

- Watchers have a default interval of 1 minute. You can override any watcher's default with any valid cronmask.
- YAML imposes restrictions on the name of a node. You can override the displayed name of a watcher by setting its optional `name` field.
- Watchers, like most other objects in *AreWeDown?* have an optional `enabled` field that defaulst to true. Set this to false to disable the watcher.
- To alert specific people about a watcher failure, use the `recipients` property. This is an optional, comma-separated list of names defined in under `recipients`. If left empty, all defined recipients will receive alerts for the watcher.

        watchers:
            mytest:
                name : my optional name
                interval: '0 0 * * TUE'
                enabled: false
                recipients: BobMcName,someOtherPerson,YetAnotherPerson

## Logs

*AreWeDown?* logs, a lot. It writes its own logs to the `/etc/arewedown/logs/<DATE>.log`, and then for each watcher in `/etc/arewedown/logs/<WATCHER>/logs/<DATE>.log`. Use `docker logs arewdown` to quickly see recent log entries.        