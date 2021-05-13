# Setup as NodeJS App

If you cannot run Docker, or are using Windows, you can install *AreWeDown?* directly as a NodeJS app. You'll have to daemonize it yoursef and install any additional runtimes though. Explaining daemonization is beyond the scope of this guide.

## Runtimes

Install NodeJS 12 or higher. There are many ways to install this, on a Debian-based system you can try

    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt-get install nodejs  -y

You should also ensure that you have Python3 installed. Additional runtimes might be added later, check this document when you update.

Yarn is highly recommended (installing with NPM is error prone).

    sudo npm install yarn -g

## Setup

Then clone this repo and setup with

    git clone https://github.com/shukriadams/arewedown.git /path/to/arewedown

It is highly recommended (but optional) that you switch to a tag to install. While every effort is made to keep the master stable, tags are fixed and tested release points. To checkout the tag `0.2.0` f.egs run 

    cd /path/to/arewedown
    git checkout 0.2.0

Then the actual setup

    cd /path/to/arewedown/src
    yarn --production 
    
If you don't want to use yarn run

     npm install --production

_Never_ run `yarn` or `npm install` with sudo, it will create a mess. If you find yourself needing to use sudo with these, you're digging yourself deeper into a problem.

## Start

To start the application (in the same directory you ran yarn in above)

    npm start

*AreWeDown?* will be available by default on `http://localhost:3000`.

## Updating

If you installed from a tag (you did install a tag, right?), switch back to master with

    cd /path/to/arewedown
    git checkout master

Then, regardless of how you installed  

    cd /path/to/arewedown/src
    git pull

Optionally, checkout the new tag you want to build

    git checkout <some-new-tag>

And simply

    yarn --production 

or

     npm update --production

