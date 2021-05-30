# Builds standalone executable binaries of Are We Down?
# --target values : linux|win|armv7
#
# linux :
# bash ./build-standalone.sh --target linux
#
# windows :
# bash build-standalone.sh --target win
#
# arm7 :
# bash build-standalone.sh --target armv7 
#
# Ignore  "Warning Cannot resolve '`./routes/${ name }`' errors
# To upload build artefacts to github, the GH_TOKEN env var must be set, with the github api token

# fail on errors
set -e

repo="shukriadams/arewedown"

# capture all arguments passed in, that is anything starting with --
while [ $# -gt 0 ]; do
    if [[ $1 == *"--"* ]]; then
        param="${1/--/}"
        declare $param="$2"
    fi
    shift
done

if [ $target = "" ]; then
    echo "ERROR : --target not set"
    exit 1
fi

buildarch=""
if [ $target = "armv7" ]; then
    buildarch="-arm"
fi

BUILDCONTAINER=shukriadams/node12build:0.0.4$buildarch

# force get tags, these don't always seem to be pulled by jenkins
if [ ! $target = "dev" ]; then
    git fetch --all --tags -f
fi

TAG=$(git describe --abbrev=0 --tags)

# ensure current revision is tagged
if [ -z "$TAG" ]; then
    echo "ERROR : tag not set."
    exit 1
fi

# write version to build
if [ ! -z $writeVersion ]; then
    node writeVersion --version $TAG --path ./../src/package.json
fi


if [ $target = "linux" ]; then
    cd ./../src
    yarn --no-bin-links --production
    cd ./../build

    filename=./linux64/arewedown
    name="arewedown_linux64"
    

    npm install

    $(npm bin)/pkg ./../src/. --targets node12-linux-x64 --output $filename

    # run app and ensure exit code was 0
    (${filename} --version )
elif [ $target = "win" ]; then
    # note  : on windows when running in Jenkins, we don't have access to any global npm packages- only local packages can be used.
    cd ./../src
    npm install --production
    cd ./../build

    filename=./win64/arewedown.exe
    name="arewedown_win64.exe"

    npm install

    $(npm bin)/pkg ./../src/. --targets node12-windows-x64 --output $filename

    # run app and ensure exit code was 0
    ($filename --version)
elif [ $target = "armv7" ]; then
    cd ./../src
    yarn --no-bin-links --production
    cd ./../build

    # NOTE : currently not working with pkg
    filename=./armv7/arewedown
    name="arewedown_armv7"

    npm install

    $(npm bin)/pkg ./../src/. --targets node12-linux-armv7 --output $filename

    # run app and ensure exit code was 0
    (${filename} --version )
elif [ $target = "dev" ]; then
    cd ./../src
    yarn --no-bin-links --production
    cd ./../build

    # this mode is for dev, and on vagrant only
    filename=./linux64/arewedown
    name="arewedown_linux64"

    pkg ./../src/. --targets node12-linux-x64 --output $filename

    # run app and ensure exit code was 0
    (${filename} --version )
else
    echo "ERROR : ${target} is not a valid --target, allowed values are [linux|win|armv7|dev]"
    exit 1
fi

if [ $? -ne 0 ]; then
    echo "ERROR : App test failed " >&2
    exit 1
fi

echo "App built"

# if --GH_TOKEN <string> or env var specified, push build to github
if [ ! -z $GH_TOKEN ]; then

    echo "uploading to github"

    GH_REPO="https://api.github.com/repos/$repo"
    GH_TAGS="$GH_REPO/releases/tags/$TAG"
    AUTH="Authorization: token $GH_TOKEN"
    WGET_ARGS="--content-disposition --auth-no-challenge --no-cookie"
    CURL_ARGS="-LJO#"

    # Validate token.
    curl -o /dev/null -sH "$GH_TOKEN" $GH_REPO || { echo "Error : token validation failed";  exit 1; }

    # Read asset tags.
    response=$(curl -sH "$GH_TOKEN" $GH_TAGS)

    # Get ID of the asset based on given filename.
    eval $(echo "$response" | grep -m 1 "id.:" | grep -w id | tr : = | tr -cd '[[:alnum:]]=')
    [ "$id" ] || { echo "Error : Failed to get release id for tag: $TAG"; echo "$response" | awk 'length($0)<100' >&2; exit 1; }

    # upload file to github
    GH_ASSET="https://uploads.github.com/repos/$repo/releases/$id/assets?name=$(basename $name)"
    curl --data-binary @"$filename" -H "Authorization: token $GH_TOKEN" -H "Content-Type: application/octet-stream" $GH_ASSET

    echo "Uploaded"
fi
