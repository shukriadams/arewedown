# builds standalone for arm7. this is for testing local builds

BUILDCONTAINER=shukriadams/node12build:0.0.4-arm
docker run -v $(pwd)/../:/tmp/build $BUILDCONTAINER sh -c 'cd /tmp/build/build && ls && npm install && bash ./build-standalone.sh --target armv7'
