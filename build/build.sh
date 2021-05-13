# fail on errors
set -e

# tag must be passed in as an argument when calling this script
ARCH=""
DOCKERPUSH=0

SMOKETEST=0
ARCHITECTURE="" # set to "-arm" for arm

while [ -n "$1" ]; do 
    case "$1" in
    --dockerpush) DOCKERPUSH=1 ;;
    --smoketest) SMOKETEST=1 ;;
    --arc)
        ARCHITECTURE="$2" shift;;         
    esac 
    shift
done

BUILDCONTAINER=shukriadams/node12build:0.0.3$ARCHITECTURE

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

# write version to build
echo $TAG > .stage/src/version

# install with --no-bin-links to avoid simlinks, this is needed to copy build content around
docker run -v $(pwd)/.stage/src:/tmp/build $BUILDCONTAINER sh -c 'cd /tmp/build/ && yarn --no-bin-links --production'

# zip the build up
tar -czvf ./build.tar.gz .stage/src 

docker build -f Dockerfile$ARCHITECTURE -t shukriadams/arewedown . 

# test mount container
if [ $SMOKETEST -eq 1 ]; then
    echo "starting smoketest"
    # test build
    docker-compose -f docker-compose-test.yml down 
    docker-compose -f docker-compose-test.yml up -d 
    # give container a chance to start
    sleep 15 

    # confirm app has started
    LOOKUP=$(curl -s -o /dev/null -D - localhost:7018 | grep "HTTP/1.1 200 OK") 
    if [ -z "$LOOKUP" ] ; then
        echo "ERROR : container test failed to return 200"
        exit 1
    fi
    echo "container test passed"
fi

if [ $DOCKERPUSH -eq 1 ]; then
    docker login -u $DOCKER_USER -p $DOCKER_PASS 
    docker tag shukriadams/arewedown:latest shukriadams/arewedown:$TAG$ARCHITECTURE 
    docker push shukriadams/arewedown:$TAG$ARCHITECTURE
fi

echo "Build done"
