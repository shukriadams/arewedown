# Are We Down?

- Simple HTTP status checking service. Use this to aggregate any status checks which use HTTP.
- Entirely self-hosted, ideal for running behind a firewall on a closed domain.
- Runs on ARM and x86.
- Runs in a Docker container.
- All config stored in a single yml file.
- Custom rules can be easily added via any linux shell script - NodeJS 12, Python3 and bash work out-of-the-box.
- Has a minimal single-page dashboard that will run on almost any browser or low-spec device, ideal for Raspberry Pi's in kiosk mode. 
- Shows basic history of uptime changes.
- Sends alerts via SMTP, Slack and others coming.

## Get it

A docker image is available @ https://hub.docker.com/r/shukriadams/arewedown 

## Setup

- create settings.yml, use src/settings.yml as example. Add sites you want to test. Set sane poll intervals. Adds email addresses of people who need to be alerted.
- create *logs* folder, 
- chown 1000 -R logs
- see ./docker-compose.yml if you want to use docker-compose.

## Config

All config is written in a single YML file `setup.yml` in the project root. 

You can restart `Are We Down?` to update settings by running using the `/restart` route.

### Customize your container

If you're running Docker and need to install a runtime or package, you can do this at app start using `onstart` in settings.yml. The `sudo` command is available to the `arewedown` user in the container

    ...
    onstart: sudo apt-get install <some-package> -y
    ...

Suppose you mount your own NodeJS application (ie package.json) in `/opt/mytests` in your container. You need to run `npm install` on this first to ensure required local package are installed. 

    ...
    onstart: cd /opt/mytests && npm install
    ...

For performance reasons, it's best to keep `onstart` short, and try to install things which can persist in a volume mount, else you'll end up reinstalling from scratch each time your container restarts.

## Tranmissions

Transmissions are used to send alerts when watcher states change. Currently the following transmission types are supported

### SMTP

#### Google SMTP Settings

    smtp:
        enabled: true
        server : smtp.gmail.com
        port : 465
        secure : true
        user : your-user@gmail.com
        pass: your-gmail-password
        from : your-user@gmail.com

## Dashboards

Dashboards let you vizualize watchers. A given dashboard can display the status of any watcher. Dashboards automatically reload to update watcher state, and are written to be display on large screens on low-performance devices such as Raspberry Pi's.

## Tests

### net.httpCheck

    watchers:
        mytest:
            # required
            interval: "*/1 * * * *"
            # required
            url: http://example.com
            # optional: normally any 2** code is treated as pass, but you can specifiy the expected code
            code: 403
            

## Your own scripts

`Arewedown?` is written around custom shell scripts.

- Your can use any script / scripting language that you can call from the operating system shell.
- All watcher configuration is passed to the script as '--' arguments. If your config looks like

        watchers:
            mywatcher:
                interval: "*/1 * * * *"
                cmd: node /home/bob/mytest.js
                foo: bar

    then inside `/home/bob/mytest.js` you will have access to the argument `--foo` with value `bar`.

### Getting args in Python3

Using command line args in Python3 is easily done with built-in `argparse`

    import sys
    import argparse

    parser = argparse.ArgumentParser()
    parser.add_argument('--foo', '-f')
    args, unknown = parser.parse_known_args()

    # args.foo > 

### Getting args in NodeJS

The easiest way to get command line arguments passed to a NodeJS script is with [minimist](https://www.npmjs.com/package/minimist). If you don't want to install npm packages use this function

    function getArg(arg){
        for (let i = 0 ; i < process.argv.length ; i ++)
            if (process.argv[i] == `--${arg}` && process.argv.length >= i)
                return process.argv[i + 1]
        return null
    }

    const foo = getArg('foo') // > "bar"

### Getting args in sh

Parsing args in bash or similar is done thusly

    FOO="not set"

    while [ -n "$1" ]; do 
        case "$1" in
        -f|--foo)
            FOO="$2" shift;;
        esac 
        shift
    done

    echo $FOO

### Vagrant

Vagrant will scaffold up a full dev runtime in a VM, and is my preferred way of managing project setup. This project was confirmed working on Vagrant 2.2.4 and VirtualBox 6.0.6.

To use

- cd vagrant
- vagrant up
- vagrant ssh

## Credits

Icons by FeatherIcons (https://github.com/feathericons/feather)
