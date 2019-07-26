const CronJob = require('cron').CronJob,
    nodemailer = require('nodemailer'),
    jsonfile = require('jsonfile'),
    path = require('path'),
    request = require('request');
    fs = require('fs-extra'),
    Logger = require('winston-wrapper'),
    settings = require('./settings'),
    flagFolder = './flags';

fs.ensureDirSync(flagFolder);

let cronJobs = [];

class CronProcess
{
    constructor(name, url, interval, expect, test){
        this.logInfo = Logger.instance().info.info;
        this.logError = Logger.instance().error.error;
        this.interval = interval;
        this.expect = expect;
        this.test = test;
        this.name = name;
        this.url = url;
        this.isPassing = false;
        this.errorMessage = null;
        this.busy = false;
        this.lastRun = new Date();
    }

    start(){
        
        this.logInfo('Starting service' + this.interval)

        this.cron = new CronJob(this.interval, async()=>{
            try
            {
                if (this.busy){
                    this.logInfo(`${this.name} check was busy from previous run, skipping`);
                    return;
                }
        
                this.busy = true;
                await this.work();

            } catch (ex){
                console.log(ex);
                this.logError(ex);
            } finally {
                this.busy = false;
            }
        }, null, true);
    }

    async work(){
        try {
            const response = await this.downloadString();

            if (this.test){

                if (this.test === 'gt')
                    this.isPassing = response > this.expect;
    
                if (this.test === 'lt')
                    this.isPassing = response < this.expect;

                if (this.test === 'eq')
                    this.isPassing = response < this.expect;

                if (!this.isPassing)
                    this.errorMessage = `Got ${response}, expected ${this.expect}`

            } else {
                this.isPassing = true;
                this.errorMessage = null;
            }
        } catch(ex){
            this.logError(ex);
            console.log(ex);
            console.log('failed');
            this.isPassing = false;
            this.errorMessage = ex;
        }

        this.lastRun = new Date();

        let flag = path.join(flagFolder, this.name);

        if (this.isPassing){
            if (await fs.exists(flag)){
                await fs.remove(flag);
                console.log(`Flag removed for ${this.name}`);
            }
        } else {

            if (!await fs.exists(flag)){
                
                jsonfile.writeFileSync(flag, {
                    date : new Date()
                });

                console.log(`Flag created for ${this.name}`);
    
                if (settings.smtp){
                    let message = `${this.name} is down`;

                    for (let recipient of settings.recipients){
                        let transporter = nodemailer.createTransport({
                            host: settings.smtp.server,
                            port: settings.smtp.port,
                            secure: settings.smtp.secure
                        });
                        
                        let mailOptions = {
                            from: settings.fromEmail,
                            to: recipient, 
                            subject: settings.emailSubject,
                            text: message
                        };
                    
                        let mailResult = await transporter.sendMail(mailOptions)
                        console.log(`Sent email to ${recipient} for process ${this.name}`);
                        this.logInfo(mailResult);
                    }
                }

            }
        }
    }

    async downloadString(){
        return new Promise((resolve, reject)=>{
            request( {uri: this.url }, 
                function(error, response, body) {
                    if (error)
                        return reject(error);

                    resolve(body);
                }
            )
        });
    }
}

module.exports = {
    
    cronJobs,

    start : ()=>{
        for (const job of settings.jobs){
            const cronjob = new CronProcess(job.name, job.url, job.interval, job.expect, job.test );
            cronJobs.push(cronjob);
            cronjob.start();
        }
    }
}
