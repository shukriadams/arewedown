# This script builds this project at a pre-existing tag, creates a docker image from the build, and the pushes
# that image to the official container repo. 
#
# Use :
# cd /docker
# sh ./buildTag x.y.z (where x.y.z) is the tag to build.


# tag must be passed in as an argument when calling this script
TAG=$1
ARMCHECK=$(lscpu | grep arm)
ARCH=""

if [ -z "$TAG" ]; then
   echo "Error, tag not set. Tag must be a valid github repo tag. Call this script : ./buildTag myTag";
   exit 1;
fi

if [ ! -z "$ARMCHECK" ]; then
    ARCH=-arm;
fi

# clone working copy of repo at the latest tag
rm -rf .clone &&
git clone --depth 1 --branch $TAG https://github.com/shukriadams/arewedown.git .clone &&


# kill any existing build container
docker-compose -f docker-compose-build${ARCH}.yml kill &&
docker-compose -f docker-compose-build${ARCH}.yml up -d &&


# clean out build container incase it's been previous used
docker exec buildcontainer sh -c 'rm -rf /tmp/build/*' &&
docker exec buildcontainer sh -c 'rm -rf /tmp/stage/*' &&

docker exec buildcontainer sh -c 'mkdir -p /tmp/build' &&
docker exec buildcontainer sh -c 'mkdir -p /tmp/stage' &&

# copy tag clone into buildcontainer
docker cp ./.clone/src/. buildcontainer:/tmp/build &&


# install with --no-bin-links to avoid simlinks, this is needed to copy build content around
docker exec buildcontainer sh -c 'cd /tmp/build/ && npm install --no-bin-links' &&


# copy build to stage folder, clean out node_modules and _fe because these are needed for build stage only
docker exec buildcontainer sh -c 'cp -R /tmp/build/* /tmp/stage && rm -rf /tmp/stage/node_modules' &&


# do a fresh npm install of production-only modules
docker exec buildcontainer sh -c 'cd /tmp/stage/ && npm install --production --no-bin-links' &&


# zip the build up
docker exec buildcontainer sh -c 'tar -czvf /tmp/build.tar.gz /tmp/stage' &&
docker cp buildcontainer:/tmp/build.tar.gz . &&



docker build -t shukriadams/arewedown . &&
docker tag shukriadams/arewedown:latest shukriadams/arewedown:$TAG${ARCH} &&

# test mount container
docker-compose -f docker-compose-test.yml kill &&
docker-compose -f docker-compose-test.yml up -d &&

# need to wait a few seconds for container AND node app to start
# todo : find more elegant way to confirm running tried 
# `/usr/bin/docker inspect -f {{.State.Running}} CONTAINERNAME` which returns true on container but app still not started
sleep 5; 

RESPONSE=$(curl -s localhost:7018/isalive) && 
if [ "$RESPONSE"="ARE WE DOWN? service is running" ]
then
    echo "Container test passed";
else
    echo "Container test failed with response \"${RESPONSE}\"";
    exit 1;
fi


#docker push shukriadams/arewedown:latest &&
#docker push shukriadams/arewedown:$TAG${ARCH} &&

echo "Build done";
