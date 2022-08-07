![Screenshot of AreWeDown?](https://github.com/shukriadams/arewedown/blob/master/screenshot.PNG)

*Are We Down?* is a simple uptime monitoring system and dashboard. It is ideal for the home/self-hosting user who runs multiple services/networked devices on a private LAN, and who doesn't want the complexity of an enterprise-level monitoring system. It lets you turn any HTTP endpoint into a status indicator. SSH into things and test that way. Gather all your tests into a single or multiple dashboards. And it's easy to set up.

[![codecov](https://codecov.io/gh/shukriadams/arewedown/branch/develop/graph/badge.svg?token=DXO5XYWW2T)](https://codecov.io/gh/shukriadams/arewedown)

## Features 

- Simple to configure with just a few lines of text in a single YML file.
- No databases or dependencies on other services.
- Does HTTP status checks, ssh, ping, Docker container status and more. 
- Sends alerts via email (SMTP) and Slack.
- Can be extended with your own test scripts using shell scripts, Javascript (NodeJS) or Python3 scripts.
- Runs on x86 and ARM (Docker images available for the Raspberry Pi 3 or better).
- Built-in dashboard will run on almost any browser, ideal for a Raspberry Pi in kiosk mode. 

*NOTE:* *Are We Down?* has no built-in security, never expose it to the public internet. It is perfectly safe running behind a trusted firewall/router, that is what it was intended for. 

## Install options

- [Docker](/docs/install-docker.md) - Linux x64 + ARMv7.

- [Binaries](/docs/install-binaries.md) - Linux + Windows x64 (these are still experimental).

- [NodeJS source](/docs/install-nodejs.md) - any OS that supports NodeJS 12.x or better.

## Config

The most basic setup of *Are We Down?* can be done with only

    watchers:
        mysite:
            host: http://mysite.example.com

This sets up a single watcher that scans the given domain every minute for HTTP status 200, and displays this on a dashboard. See [settings](/docs/settings.md) for details.

### Transports

Alerts can be sent with the following methods :

- SMTP (good old email)
- Slack

### Watchers

The following built-in tests are available :

- HTTP status
- TCP port open
- Docker container up
- Jenkins job passing
- System.d process status

### Custom tests

In addition to using built-in tests, you can also write tests in bash, NodeJS or Python3 if you're more into that sort of thing. For details see [custom code tests](/docs/custom-tests.md).

## Interested in contributing?

See [contributing](/docs/contributing.md) if you'd like to improve this project.

## License

*AreWeDown?* is available under the [GPL3.0 license](https://github.com/shukriadams/arewedown/blob/master/LICENSE).
