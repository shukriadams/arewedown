# fail on errors
set -e

# get tag fom current context
TAG=$(git describe --abbrev=0 --tags)
if [ -z $TAG ]; then
   echo "ERROR : tag not set."
   exit 1
fi

# shorten x.y.z tag to just x.y for docker "short" minor tag. If we're doing a test a release, tag will have a string appended,  egs x.y.z-test,
# which will return an empty string
# minorTag is done in a nodejs script because it's much easier to use regex in JS than in bourne shell.
MINOR_TAG=$(node ./toMinorTag --version $TAG) 

docker login -u $DOCKER_USER -p $DOCKER_PASS 

docker manifest create \
    shukriadams/arewedown:$TAG \
    --amend shukriadams/arewedown:$TAG-amd64 \
    --amend shukriadams/arewedown:$TAG-arm32v7

docker manifest push shukriadams/arewedown:$TAG

if [ ! -z $MINOR_TAG ]; then
    docker manifest create \
        shukriadams/arewedown:$MINOR_TAG \
        --amend shukriadams/arewedown:$MINOR_TAG-amd64 \
        --amend shukriadams/arewedown:$MINOR_TAG-arm32v7

    docker manifest push shukriadams/arewedown:$MINOR_TAG
fi

echo "Manifest pushed"