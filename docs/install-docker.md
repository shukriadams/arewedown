# Setup with Docker

Docker images are available @ https://hub.docker.com/r/shukriadams/arewedown. Find an up-to-date tag there (this project does not build `:latest`). If you intend to run on a Raspberry Pi, use `<TAG>-arm`

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
            # - ./scripts:/etc/arewedown/custom-tests # optional, see "custom tests" section of documentation
            ports:
            - "3000:3000"

- Two directory volume mounts are required, one for logs, the other for config.
    - Ensure write access to the `logs` directory, the container runs with user id 1000, use `chown -R 1000 path/to/logs` to enable writes, or the app will fail.
    - Create an empty `settings.yml` file in the config directory, this is where all application settings live.