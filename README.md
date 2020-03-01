# ARE WE DOWN?

Master branch

[![Build Status](https://travis-ci.org/shukriadams/arewedown.svg?branch=master)](https://travis-ci.org/shukriadams/arewedown)

Develop branch

[![Build Status](https://travis-ci.org/shukriadams/arewedown.svg?branch=develop)](https://travis-ci.org/shukriadams/arewedown)

- Simple HTTP status checking service. Use this to aggregate any status checks which use HTTP.
- Entirely self-hosted, ideal for running behind a firewall on a closed domain.
- Custom rules can be easily added via Javascript extension scripts.
- Has a minimal single-page dashboard that will run on almost any browser or low-spec device, ideal for Raspberry Pi's in kiosk mode. 

## Get it

A docker image is available @ https://hub.docker.com/r/shukriadams/arewedown (includes ARM images for Raspberry Pi)

## Setup

- create settings.yml, use src/settings.yml as example. Add sites you want to test. Set sane poll intervals. Adds email addresses of people who need to be alerted.
- create *watchers* folder, 
- chown 1000 -R watchers
- if you want to persists logs, create logs folder and chown as above
- use docker/docker-compose-yml as base for your docker-compose file.

## Dashboards

## Tests

One of the main reasons for Are We Down? is to make it simple to write custom uptime tests in Javascript.

- Tests are JS modules which export async functions.
- Tests must throw exceptions when they fail. The entire exception will be presented as the failed reset.
- A job object is passed to the function, this contains the configuration for that job as defined in settings.json.
- You can write whatever javascript you want in the test, but you are currently limited to this project's prebundled JS libraries. 

A test should look like

    module.exports = async function(watcher){
        let conditionMet = false;

        if (!conditionMet)
            throw `Test failed!`;
    }

1. A test should throw an exception when it fails. If it doesn't throw an exception, the test run will be trated as passed.

2. A watcher object is passed to the test, this object contains all the config for that given watcher, as it is written in settings.yml. You can use this to pass information to the test.

### Debugging tests

When writing tests, it helps to be able to test them to see if they work. 

1. Write a new test in settings.yml. Disable it so it won't get automatically fired.

    watchers:
        mywatcher:
            enabled: false
            test: user/mytest

2. Write your test in the file *tests/user/mytest.js*. If you're running in Docker, mount the folder *tests/user* as a volume and place your test file in that.

3. Execute the test with

        node testwatcher --watcher mywatcher

  If youre're running in docker use

        docker exec -it [arewedowncontainer] bash -c "node testwatcher --watcher mywatcher"

## Development

If you're interested in developing Are We down, continue reading.

### Vagrant

Vagrant will scaffold up a full dev runtime in a VM, and is my preferred way of managing project setup. This project was confirmed working on Vagrant 2.2.4 and VirtualBox 6.0.6.

To use

- cd vagrant
- vagrant up
- vagrant ssh

## Credits

Icons by FeatherIcons (https://github.com/feathericons/feather)
