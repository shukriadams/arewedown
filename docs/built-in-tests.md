
# Built-in Tests

Watchers watch things to see if they are passing or failing.

## HTTP 200 Test

The simplest and default watcher is the HTTP check. It requests a URL and fails if it doesn't get a response between 200 and 299. You can specify code if the URL you're calling "passes" with an error code. f.ex a `403` error (login required) can still indicate that a service is up.

    watchers:
        mytest:
            url: http://example.com
            code : 200 # optional

*AreWeDown?* has several built-in tests ([all tests](https://github.com/shukriadams/arewedown/tree/master/src/tests))

## Port open Test

Tests if a port at the given address is open. Works on TCP only.

    watchers:
        port:
            test: net.portOpen
            host: 192.168.1.126
            port: 8006

## Jenkins job status Test

Test if a jenkins job is passing. Requires Jenkins server URL and the name of the job in jenkins. 

- URL can be any URL that gives access to the server, this is often with built-in credentials. 
- Job name can be the human-friendly version, we'll make it URL-safe.
- Test passes on success only, all other outcomes will be read as a failure. 
- Status is optional, and a comma-separated list. Default value is "success". This filters on the string values returned by Jenkins' API for job status, which is 
"success", "aborted" and "failure".

          watchers:
                my_jenkins_job:
                    test : jenkins.buildSuccess
                    host: http://<USER>:<PASSWORD>@example.com
                    job: My Jenkins Job
                    status: success,aborted # Optional.

## Docker container up

If your have the Docker [HTTP API](https://docs.docker.com/engine/api/v1.24/) enabled, you can query it to test if a container is up on a given host. 

    watchers:
        my-container-test:
            test: docker.containerIsUp
            host: http://example.com
            container: myContainer # container name
            port: 2375 # Optional. Port to query, the default is 2375.

## System.d service running

To test if a system.d service is running you (all items required)

    watchers:
        my-service-test:
            test: systemd.servicerunning
            host: example.com
            user: myuser
            password: mypassword
            service: docker

## Ping

You can ping a host 