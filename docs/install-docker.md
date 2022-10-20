# Setup with Docker

Docker images are available on [Docker hub](https://hub.docker.com/r/shukriadams/arewedown). 

- An example docker-compose.yml is

        version: "2"
        services:
            arewedown:
                image: shukriadams/arewedown:<TAG>
                container_name: arewedown
                restart: unless-stopped
                volumes:
                - ./config:/etc/arewedown/config
                - ./logs:/etc/arewedown/logs/:rw
                - ./queue:/etc/arewedown/queue/:rw
                # - ./scripts:/etc/arewedown/custom-tests # optional, see "custom tests" section of documentation
                ports:
                - "3000:3000"


- Replace `<TAG>` with the latest two digit tag available, egs `0.2`, or something more specific.
- Two directory volume mounts are required, one for logs, the other for config.
    - Ensure write access to the `logs` directory, the container runs with user id 1000, use `chown -R 1000 path/to/logs` to enable writes, or the app will fail.
    - Create a `settings.yml` file in the config directory, this is where all application settings live. This file can be empty to begin with.
- Docker images support AMD64 and ARM32v7, the correct one will be fetched for your device.

# Versions and staying up to date

This project uses the [recommended Docker tagging convention](https://github.com/docker-library/official-images#tags-and-aliases). Each build is marked with a semantic version tag, egs `0.2.4`, which always corresponds to a [release](https://github.com/shukriadams/arewedown/releases) on Github. Additionally, each build is given a rolling minor tag, for `0.2.4` it would be `0.2`. `0.2` would then move to `0.2.5` when the latter is released, and so on, until `0.3.0` is released, at whichpoint `0.2` would stop being moved and `0.3` would become the next rolling tag. This means you can set your docker orchestration system to use a minor tag and enable automatic updates on it, as new builds will be backward compatible with previous ones.

You should avoid auto-updating across minor versions - a minor version increment means a breaking change has been introduced, requiring that you intervene, check the update notes, and possibly change something in your deployment. Yes, software version numbers have a purpose.

This project does not use the `latest` tag, as this is often misused and misunderstood (there are plenty of posts online explaining why).

