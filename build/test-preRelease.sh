set -e

BUILDCONTAINER=shukriadams/node12build:0.0.4

cd ../

docker run \
    -v $(pwd):/tmp/arewedown \
    -e AWD_SETTINGS_PATH=./../build/config/settings.yml \
    $BUILDCONTAINER sh -c 'cd /tmp/arewedown/src && yarn install --verbose --ignore-engines --no-bin-links'
