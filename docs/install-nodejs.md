# Setup as NodeJS App

If you cannot run Docker, you can install *AreWeDown?* directly as a NodeJS app. This will work on any platform that support NodeJS, including older ARMv6 Raspberry Pi's.

## Runtimes

Install NodeJS 12 or higher. There are many ways to install this, on a Debian-based system you can try

    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt-get install nodejs  -y

Yarn is highly recommended as NPM is error-prone.

    npm install yarn -g

(sudo required on linux)

## Setup

Then clone this repo and setup with

    git clone https://github.com/shukriadams/arewedown.git /path/to/arewedown

It is highly recommended (but optional) that you switch to a tag to install. While every effort is made to keep the master branch stable, tags are fixed and tested release points, and much more reliable. To checkout the tag `0.2.0` f.egs run 

    cd /path/to/arewedown
    git checkout 0.2.0

Then the actual setup

    cd /path/to/arewedown/src
    yarn --production 
    
If you don't want to use yarn run

     npm install --production

_Never_ run `yarn` or `npm install` with sudo, if you find yourself needing to use sudo with these, you're brute-forcing invalid permissions somewhere in you setup, and your app will likely never work properly even if it starts. Fix your permissions, then install.

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

If you're using tags (you are using tags, right?), checkout the tag you want to upgrade to

    git checkout <some-new-tag>

And simply

    yarn --production 

or

     npm update --production

## Daemonizing

A NodeJS app is not daemonized by itself - ie will not automatically restart itself if it crashes or when your device reboots. Explaining daemonization is beyond the scope of this guide. For Windows you can try [NSSM](https://nssm.cc/), Linux has multiple solutions, but if you're new to it you can try [PM2](https://pm2.keymetrics.io/).

## Troubleshooting

While installation on older models of the Raspberry Pi is possible, you will likely get timeouts. Try adding a network timeout if Yarn complains about NPM packages being unavailable

    yarn <args> --network-timeout=10000
