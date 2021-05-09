# Are We Down?

![Screenshot of AreWeDown?](/screenshot.jpg)

- Simple to setup and use
- Sends alerts via email (SMTP), Slack and others coming.
- Supports HTTP status checking service
- Extend with your own tests using shell scripts, Javascript (NodeJS) or Python3 scripts.
- All configuration stored in YML 
- No database, no dependencies on other services like Influx or Prometheus 
- Runs on x86 and ARM, Docker containers built for both. Tested on a Raspberry Pi 3.
- Dashboards will run on almost any browser or low-spec device, ideal for Raspberry Pi's in kiosk mode. 

## Setup in Docker

Docker images are available @ https://hub.docker.com/r/shukriadams/arewedown. Find an up-to-date tag there, this project does not build `:latest` (and you shouldn't deploy anything with that tag). If you intend to run on a Pi, use `<TAG>-arm`

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
    - Ensure write access to the `logs` directory, the container runs with user id 1000, use `chown -R 1000 path/to/logs` to allow log writing.
    - Create an empty `settings.yml` file in the config directory, this is where all application settings live.

## Logs

_AreWeDown?_ logs a lot. It writes its own logs to the `./logs/<DATE>.log`, and then for each watcher in `./logs/<WATCHER>/logs/<DATE>.log`. You can also do a simple `docker logs arewdown` to see recent events.

## Config

`Settings.yml` Is divided up into 3 main sections. 

    transmissions:
        ...

    recipients:
        ...

    watchers:
        ....

### Tranmissions

Transmissions are used to send out alerts when watcher states change. Tranmissions are tested and logged automatically when _AreWeDown?_ starts, so check logs to ensure your settings work.

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
        foo:
            smtp: foo@example.com
        bar:
            smtp: bar@example.com

### Watchers

Watchers watch things to see if they are passing or failing.

#### Default settings

- Watchers have a default interval of 1 minute. You can override any watcher's default with any valid cronmask.
- YAML imposes restrictions on the name of a node. You can override the displayed name of a watcher by setting its optional `name` field.
- Watchers, like most other objects in _AreWeDown?_ have an optional `enabled` field that defaulst to true. Set this to false to disable the watcher.

        watchers:
            mytest:
                name : my optional name
                interval: '0 0 * * TUE'
                enabled: false

#### HTTP 200 Test

The simplest and default watcher is the HTTP check. It requests a URL and fails if it doesn't get a response between 200 and 299.

    watchers:
        mytest:
            url: http://example.com

_AreWeDown?_ has several built-in tests ([all tests](https://github.com/shukriadams/arewedown/tree/master/src/tests)

#### Port open Test

Tests if a port at the given address is open. Works on TCP only.

    watchers:
        port:
            test: net.portOpen
            host: 192.168.1.126
            port: 8006

#### Jenkins job status Test

Test if a jenkins job is passing

    watchers:
        my_jenkins_job:
            test : jenkins.buildSuccess
            url: http://<USER>:<PASSWORD>@<JENKSINSURL>
            job: my jenkins job

#### Custom tests

 _AreWeDown?_ also supports calling shell scripts for tests. For example, you can write your tests directly in `settings.yml`. To test if NFS is running at a remote, you can use

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
        