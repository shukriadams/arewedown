set -e

BUILDCONTAINER=shukriadams/node12build:0.0.4
cd ../src
docker run -v $(pwd):/tmp/test $BUILDCONTAINER sh -c 'cd /tmp/test && yarn install --no-bin-links && npm test && npm run cover'
