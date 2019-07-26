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
        this.errorMessage = 'Checking has not run yet';
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
                this.logError(ex);
            } finally {
                this.busy = false;
            }
        }, null, true);
    }

    async work(){
        try {
            const response = await this.downloadString();

            this.errorMessage = null;
            this.isPassing = true;
            this.lastRun = new Date();

            if (this.test){

                if (this.test === 'gt')
                    this.isPassing = response > this.expect;
    
                if (this.test === 'lt')
                    this.isPassing = response < this.expect;

                if (this.test === 'eq')
                    this.isPassing = response < this.expect;
            }

            if (!this.isPassing)
                this.errorMessage = `Got ${response}, expected ${this.expect}`

        } catch(ex){
            this.errorMessage = ex.errno === 'ENOTFOUND' ? `${this.url} could not be reached.` :this.errorMessage = ex;
            this.isPassing = false;
        }

        if (this.errorMessage)
            this.logInfo(this.errorMessage);
        else 
            this.logInfo(`${this.name} check passed`);


        let flag = path.join(flagFolder, this.name),
            statusChanged = false,
            historyFolder = path.join(flagFolder, `${this.name}_history`);
        

        if (this.isPassing){
            if (await fs.exists(flag)){
                await fs.remove(flag);
                await fs.ensureDir(historyFolder);

                jsonfile.writeFileSync(path.join(historyFolder, `${this.lastRun.getTime()}.json`), {
                    status : 'up',
                    date : this.lastRun
                });
                
                this.logInfo(`Status changed, flag removed for ${this.name}`);
                statusChanged = true;
            }
        } else {

            if (!await fs.exists(flag)){

                await fs.ensureDir(historyFolder);
                
                jsonfile.writeFileSync(flag, {
                    date : new Date()
                });

                jsonfile.writeFileSync(path.join(historyFolder, `${this.lastRun.getTime()}.json`), {
                    status : 'down',
                    date : new Date()
                });

                this.logInfo(`Status changed, flag created for ${this.name}`);
                statusChanged = true;
            }
        }

        if (statusChanged){
            if (settings.smtp){
                let message = this.isPassing ? `${this.name} is up` : `${this.name} is down`;
    
                for (let recipient of settings.recipients){
                    let transporter = nodemailer.createTransport({
                        host: settings.smtp.server,
                        port: settings.smtp.port,
                        secure: settings.smtp.secure
                    });
                    
                    let mailOptions = {
                        from: settings.fromEmail,
                        to: recipient, 
                        subject: this.isPassing ? `${this.name} is up` : `${this.name} is down`,
                        text: message
                    };
                
                    let mailResult = await transporter.sendMail(mailOptions)
                    this.logInfo(`Sent email to ${recipient} for process ${this.name}`);
                    this.logInfo(mailResult);
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
