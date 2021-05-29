# fail on errors
set -e


# tag must be passed in as an argument when calling this script
DOCKERPUSH=0
SMOKETEST=0
ARCH="amd64" # set to amd64|arm32v7
BUILDARCH="" # set to "-arm" for arm, -arm corresponds to arm32v7 at the moment

while [ -n "$1" ]; do 
    case "$1" in
    --dockerpush) DOCKERPUSH=1 ;;
    --smoketest) SMOKETEST=1 ;;
    --arch)
        ARCH="$2" shift;;
    --buildarch)
        BUILDARCH="$2" shift;;

    esac 
    shift
done

if [ $ARCH = "arm32v7" ]; then
   BUILDARCH="-arm" 
fi

BUILDCONTAINER=shukriadams/node12build:0.0.4$BUILDARCH



# get tag fom current context
TAG=$(git describe --abbrev=0 --tags)
if [ -z $TAG ]; then
   echo "ERROR : tag not set."
   exit 1
fi


# copy src to .stage so we can build it both locally and on Github without writing unwanted changes into src
rm -rf .stage
mkdir -p .stage
rsync -v -r --exclude=node_modules --exclude=test --exclude=data --exclude=user-scripts --exclude=settings.yml --exclude=.* ./../src .stage

# write version to package.json in ./stag/src
docker run -v $(pwd):/tmp/build $BUILDCONTAINER sh -c 'cd /tmp/build && node writeVersion --version $TAG'

# install with --no-bin-links to avoid simlinks, this is needed to copy build content around
docker run -v $(pwd)/.stage/src:/tmp/build $BUILDCONTAINER sh -c 'cd /tmp/build/ && yarn --no-bin-links --production'

docker build -f Dockerfile-$ARCH -t shukriadams/arewedown . 

# test mount container
if [ $SMOKETEST -eq 1 ]; then

    echo "starting smoketest"
    docker network create --driver bridge testingNetwork || true

    # test build
    docker-compose -f docker-compose-test.yml down 
    docker-compose -f docker-compose-test.yml up -d 
    # give container a chance to start
    sleep 15 

    # get test container IP
    TEST_CONTAINER_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' arewedowntest)

    cd ../tests
    docker run -e TEST_URL="http://${TEST_CONTAINER_IP}:3000" -v $(pwd):/tmp/test --network testingNetwork $BUILDCONTAINER sh -c 'cd /tmp/test && yarn --no-bin-links && npm test'

    echo "container test passed"
    
    cd --
fi

if [ $DOCKERPUSH -eq 1 ]; then
    docker login -u $DOCKER_USER -p $DOCKER_PASS 
    docker tag shukriadams/arewedown:latest shukriadams/arewedown:$TAG-$ARCH 
    docker push shukriadams/arewedown:$TAG-$ARCH
fi

echo "Build done"
