# tag must be passed in as an argument when calling this script
TAG=$1

if [ -z $TAG ]; then
   echo "Error, tag not set. Tag must be a valid github repo tag. Call this script : ./buildTag myTag";
   exit 1;
fi

# clone working copy of repo at the latest tag
rm -rf .clone &&
git clone --depth 1 --branch $TAG https://github.com/shukriadams/amidown.git .clone &&

# copy source code and keys into build container and compile it.
mkdir -p ./.keys && 
cp ~/.ssh/* -R ./.keys &&

# kill any existing build container
docker-compose -f docker-compose-build.yml kill &&

docker-compose -f docker-compose-build.yml up -d &&

# clean out build container incase it's been previous used
docker exec buildcontainer sh -c 'rm -rf /tmp/build/*' &&
docker exec buildcontainer sh -c 'rm -rf /tmp/stage/*' &&

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

docker build -t shukriadams/amidown . &&
docker tag shukriadams/amidown:latest shukriadams/amidown:$TAG &&
#docker push shukriadams/amidown:latest &&
#docker push shukriadams/amidown:$TAG &&

echo "Build done";