# AM I DOWN

Simple HTTP status checking service, which can itself be tied to an even simpler service like Uptime Robot.

# Setup

- create settings.json, use src/settings-example.json as example. Add sites you want to test. Set sane poll intervals. Adds email addresses of people who need to be alerted.
- create flags folder, 
- chown 1000 -R flags
- if you want to persists logs, create logs folder and chown as above
- use docker/docker-compose-yml as base for your docker-compose file.