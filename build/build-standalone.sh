# use on linux :
# bash ./build-standalone.sh --target <TARGET> --upload --token <GITHUB TOKEN>
#
# use on windows :
# sh build-standalone.sh --target TARGET
#
# Ignore  "Warning Cannot resolve '`./routes/${ name }`'

# fail on errors
set -e 

ARCHITECTURE="" # set to "-arm" for arm
repo="shukriadams/arewedown"
BUILDCONTAINER=shukriadams/node12build:0.0.3$ARCHITECTURE

# capture all arguments passed in, that is anything starting with --  
while [ $# -gt 0 ]; do
    if [[ $1 == *"--"* ]]; then
        param="${1/--/}"
        declare $param="$2"
    fi
    shift
done

if [ "$target" = "" ]; then
    echo "ERROR : --target not set"
    exit 1
fi


# force get tags, these don't always seem to be pulled by jenkins
if [ ! "$target" = "dev" ]; then
    git fetch --all --tags
fi

TAG=$(git describe --abbrev=0 --tags)

# ensure current revision is tagged
if [ -z "$TAG" ]; then
    echo "ERROR : tag not set."
    exit 1
fi

# npm install all the things
docker run -v $(pwd)/../src:/tmp/build $BUILDCONTAINER sh -c 'cd /tmp/build/ && yarn --no-bin-links --production'

# write version to build
echo $TAG > ./../src/version

if [ "$target" = "linux" ]; then
    filename=./linux64/arewedown
    name="arewedown_linux64"
    
    npm install

    $(npm bin)/pkg ./../src/. --targets node12-linux-x64 --output $filename

    # run app and ensure exit code was 0
    (${filename} --version )
elif [ "$target" = "win" ]; then
    filename=./win64/arewedown.exe
    name="arewedown_win64.exe"
    
    npm install

    $(npm bin)/pkg ./../src/. --targets node12-windows-x64 --output $filename
    
    # run app and ensure exit code was 0
    ($filename --version)
elif [ "$target" = "armhf" ]; then
    # NOTE : currently not working with pkg
    filename=./armhf/arewedown
    name="arewedown_armhf"
    
    npm install

    $(npm bin)/pkg ./../src/. --targets node12-linux-armv7 --output $filename

    # run app and ensure exit code was 0
    (${filename} --version ) 
elif [ "$target" = "dev" ]; then
    # this mode is for dev, and on vagrant only
    filename=./linux64/arewedown
    name="arewedown_linux64"

    pkg ./../src/. --targets node12-linux-x64 --output $filename

    # run app and ensure exit code was 0
    (${filename} --version )
else
    echo "ERROR : ${target} is not a valid --target, allowed values are [linux|win|armhf|dev]"
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