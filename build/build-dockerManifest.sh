# fail on errors
set -e

# get tag fom current context
TAG=$(git describe --abbrev=0 --tags)
if [ -z $TAG ]; then
   echo "ERROR : tag not set."
   exit 1
fi

docker login -u $DOCKER_USER -p $DOCKER_PASS 

docker manifest create \
    shukriadams/arewedown:$TAG \
    --amend shukriadams/arewedown:$TAG-amd64 \
    --amend shukriadams/arewedown:$TAG-arm32v6 \
    --amend shukriadams/arewedown:$TAG-arm32v7

docker manifest push shukriadams/arewedown:$TAG

echo "Manifest pushed"