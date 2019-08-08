# ARE WE DOWN?

- Simple HTTP status checking service. Use this to aggregate any status checks which use HTTP.
- Entirely self-hosted, ideal for running behind a firewall on a closed domain.
- Custom rules can be easily added via Javascript extension scripts.
- Has a minimal single-page dashboard that will run on almost any browser or low-spec device, ideal for Raspberry Pi's in kiosk mode. 

## Get it

A docker image is available @ https://hub.docker.com/r/shukriadams/arewedown

## Vagrant

Vagrant will scaffold up a full dev runtime in a VM, and is my preferred way of managing project setup. This project was confirmed working on Vagrant 2.2.4 and VirtualBox 6.0.6.

To use

- cd vagrant
- vagrant up
- vagrant ssh

## Setup

- create settings.json, use src/settings-example.json as example. Add sites you want to test. Set sane poll intervals. Adds email addresses of people who need to be alerted.
- create flags folder, 
- chown 1000 -R flags
- if you want to persists logs, create logs folder and chown as above
- use docker/docker-compose-yml as base for your docker-compose file.

## Credits

Icons by FeatherIcons (https://github.com/feathericons/feather)