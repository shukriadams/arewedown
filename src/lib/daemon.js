const CronJob = require('cron').CronJob,
    nodemailer = require('nodemailer'),
    path = require('path'),
    request = require('request');
    fs = require('fs-extra'),
    Logger = require('winston-wrapper'),
    flagFolder = './flags';

fs.ensureDirSync(flagFolder);

let cronJobs = [],
    _settings = null;

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
        this.logInfo('starting ' + this.interval)
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
                await fs.outputFile(flag, '');
                console.log(`Flag created for ${this.name}`);
    
                if (_settings.smtp){
                    let message = `${this.name} is down`;

                    for (let recipient of _settings.recipients){
                        let transporter = nodemailer.createTransport({
                            host: _settings.smtp.server,
                            port: _settings.smtp.port,
                            secure: _settings.smtp.secure
                        });
                        
                        let mailOptions = {
                            from: _settings.fromEmail,
                            to: recipient, 
                            subject: _settings.emailSubject,
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

    start : (settings)=>{
        
        _settings = settings;

        for (const job of settings.jobs){
            const cronjob = new CronProcess(job.name, job.url, job.interval, job.expect, job.test );
            cronJobs.push(cronjob);
            cronjob.start();
        }
    }
}
