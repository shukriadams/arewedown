# Setup as NodeJS App

Install and running *AreWeDown?* directly is not recommended unless you know what you're doing - you'll be installing an older NodeJS runtime globally on your machine. You'll also need to ensure that the app restarts in the event of a crash. Explaining all this is beyond the scope of this document though - you might want to look into [PM2](https://pm2.keymetrics.io/) or similar.

The only runtime dependency is NodeJS 12. There are many ways to install this, on a Debian-based system you can try

    curl -sL https://deb.nodesource.com/setup_12.x | sudo -E bash -
    sudo apt-get install nodejs  -y

Yarn is highly recommended (installing with NPM is error prone).

    sudo npm install yarn -g

Then clone this repo and setup with

    cd src
    yarn

Finally, start the application with

    npm start

*AreWeDown?* will be available by default on `http://localhost:3000`.
