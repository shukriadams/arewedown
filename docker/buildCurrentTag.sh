# Builds the current tag, signs into docker user env vars. this script is intended for use on
# travis and other CI systems that have docker creds defined as env vars.

docker login -u $DOCKER_USER -p $DOCKER_PASS &&

TAG=$(git describe --tags --abbrev=0)
if [ ${#TAG} -eq 0 ]; then
    echo "TAG not set, exiting"
    exit 1;
fi

./buildTag $TAG