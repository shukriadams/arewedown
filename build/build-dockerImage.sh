# Use (all switches are optional)
# sh ./buildDockerImage --arch <ARCH> --smoketest --dockerpush

# ARCH can be amd64|arm32v7, if omitted defaults to "amd64"

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
    esac 
    shift
done

if [ $ARCH = "arm32v7" ] 
then
   BUILDARCH="-arm" 
fi

BUILDCONTAINER=shukriadams/node12build:0.0.4$BUILDARCH



# get tag fom current context
TAG=$(git describe --abbrev=0 --tags)
HASH=$(git rev-parse --short HEAD)
if [ -z $TAG ]; then
   echo "ERROR : tag not set."
   exit 1
fi

# shorten x.y.z tag to just x.y for docker "short" minor tag. If we're doing a test a release, tag will have a string appended,  egs x.y.z-test,
# which will return an empty string
# minorTag is done in a nodejs script because it's much easier to use regex in JS than in bourne shell.
MINOR_TAG=$(node ./toMinorTag --version $TAG) 

# delete temp stage dir, do this in container is dir will contain many subdirs with in-container ownership.
# this _could_ be fixed by properly setting user contain runs as, but that's not working yet
docker run \
    -v $(pwd):/tmp/build \
    $BUILDCONTAINER sh -c  'cd /tmp/build && rm -rf .stage'

# copy src to .stage so we can build it both locally and on Github without writing unwanted changes into src
mkdir -p .stage
rsync ./../src .stage \
    --verbose \
    --recursive  \
    --exclude=node_modules \
    --exclude=config \
    --exclude=test \
    --exclude=data \
    --exclude=logs \
    --exclude=user-scripts \
    --exclude=settings.yml \
    --exclude=.* 

cd .stage/src
sh ./get-assets.sh 
cd -

# write version to package.json in ./stag/src
docker run \
    -v $(pwd):/tmp/build \
    -e TAG=$TAG \
    $BUILDCONTAINER sh -c 'cd /tmp/build && node writeVersion --version $TAG --path ./.stage/src/package.json'

# install with --no-bin-links to avoid simlinks, this is needed to copy build content around
docker run \
    -v $(pwd)/.stage/src:/tmp/build \
    $BUILDCONTAINER sh -c 'cd /tmp/build/ && yarn --no-bin-links --production'

docker build \
    -f Dockerfile-$ARCH \
    -t shukriadams/arewedown \
    . 

# test mount container
if [ $SMOKETEST -eq 1 ]; then

    echo "starting smoketest"
    docker network create --driver bridge testingNetwork || true

    # create logs dir, ensure permissions so container can write to it. this is needed on raspberry pi only 
    # when building arm
    if [ $ARCH = "arm32v7" ]; then
        mkdir -p logs
        chown 1000 -R logs
    fi

    # test build
    docker-compose -f docker-compose-test.yml down 
    docker-compose -f docker-compose-test.yml up -d 
    # give container a chance to start
    sleep 15 

    # get test container IP
    TEST_CONTAINER_IP=$(docker inspect -f '{{range.NetworkSettings.Networks}}{{.IPAddress}}{{end}}' arewedowntest)
    if [ -z $TEST_CONTAINER_IP ]; then
        TEST_CONTAINER_IP=localhost
    fi

    echo "Test container running @ IP ${TEST_CONTAINER_IP}"
     
    cd ../tests
    
    docker run \
        -e TEST_URL="http://${TEST_CONTAINER_IP}:3000" \
        -v $(pwd):/tmp/test \
        --network testingNetwork \
        $BUILDCONTAINER sh -c 'cd /tmp/test && yarn --no-bin-links && npm test'

    echo "container test passed"
    
    cd --
fi

docker tag shukriadams/arewedown:latest shukriadams/arewedown:$TAG-$ARCH 
docker tag shukriadams/arewedown:latest shukriadams/arewedown:$HASH-$ARCH 
if [ ! -z $MINOR_TAG ]; then
    docker tag shukriadams/arewedown:latest shukriadams/arewedown:$MINOR_TAG-$ARCH 
fi

if [ $DOCKERPUSH -eq 1 ]; then
    docker login -u $DOCKER_USER -p $DOCKER_PASS 

    docker push shukriadams/arewedown:$TAG-$ARCH
    docker push shukriadams/arewedown:$HASH-$ARCH 

    if [ ! -z $MINOR_TAG ]; then
        docker push shukriadams/arewedown:$MINOR_TAG-$ARCH
    fi
fi

echo "Build done"
