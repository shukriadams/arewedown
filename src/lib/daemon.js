const CronJob = require('cron').CronJob,
    jsonfile = require('jsonfile'),
    sendgrid = require('./sendgrid'),
    smtp = require('./smtp'),
    httpHelper = require('./httpHelper'),
    path = require('path'),
    fs = require('fs-extra'),
    Logger = require('winston-wrapper'),
    settings = require('./settings'),
    flagFolder = './flags';

fs.ensureDirSync(flagFolder);

let cronJobs = [];

class CronProcess
{
    constructor(name, url, interval, expect, test, args){

        this.logInfo = Logger.instance().info.info;
        this.logError = Logger.instance().error.error;
        this.interval = interval;
        this.expect = expect;
        this.test = test;
        this.name = name;
        this.url = url;
        this.args = args;
        this.isPassing = false;
        this.errorMessage = 'Checking has not run yet';
        this.busy = false;
        this.lastRun = new Date();
        this.nextRun = null;

        this.calcNextRun();
    }

    calcNextRun(){
        if (this.cron){
            this.nextRun = new Date(this.cron.nextDates().toString());
        }
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
        }, null, true, null, null, true /*runonitit*/);
    }

    async work(){
        try {

            this.errorMessage = null;
            this.isPassing = true;
            this.lastRun = new Date();

            if (this.test){
                try {
                    let test = require(`./../tests/${this.test}`);
                    let result = test.call(this, this, this.args);
                    this.isPassing = result === true;
                } catch(ex){
                    this.isPassing = false;
                    this.errorMessage = ex;
                }
            } else {
                // do simple http get
                await httpHelper.downloadString(this.url);
            }


        } catch(ex){
            this.errorMessage = ex.errno === 'ENOTFOUND' || ex.errno === 'EAI_AGAIN' ? `${this.url} could not be reached.` :this.errorMessage = ex;
            this.isPassing = false;
        }

        this.calcNextRun();

        
        if (this.errorMessage)
            this.logInfo(this.errorMessage);
        else 
            this.logInfo(`${this.name} check passed`);


        let flag = path.join(flagFolder, this.name),
            statusChanged = false,
            historyLogFolder = path.join(flagFolder, `${this.name}_history`);

        if (this.isPassing){
            await fs.ensureDir(historyLogFolder);

            jsonfile.writeFileSync(path.join(historyLogFolder, `status.json`), {
                status : 'up',
                url : this.url,
                date : this.lastRun
            });

            if (await fs.exists(flag)){

                // site is back up after fail was previous detected, clean up flag and write log
                await fs.remove(flag);

                jsonfile.writeFileSync(path.join(historyLogFolder, `${this.lastRun.getTime()}.json`), {
                    status : 'up',
                    url : this.url,
                    date : this.lastRun
                });

                this.logInfo(`Status changed, flag removed for ${this.name}`);
                statusChanged = true;
            }
        } else {

            if (!await fs.exists(flag)){

                await fs.ensureDir(historyLogFolder);

                // site is down, write fail flag and log
                jsonfile.writeFileSync(flag, {
                    url : this.url,
                    date : new Date()
                });

                jsonfile.writeFileSync(path.join(historyLogFolder, `${this.lastRun.getTime()}.json`), {
                    status : 'down',
                    url : this.url,
                    date : new Date()
                });
                
                jsonfile.writeFileSync(path.join(historyLogFolder, `status.json`), {
                    status : 'down',
                    url : this.url,
                    date : this.lastRun
                });

                this.logInfo(`Status changed, flag created for ${this.name}`);
                statusChanged = true;
            }
        }

        // send email if site status has change changed
        if (statusChanged){

            let subject = this.isPassing ? `${this.name} is up` : `${this.name} is down`,
                message = this.isPassing ? `${this.name} is up` : `${this.name} is down`;

            let sendMethod = settings.smtp ? smtp :
                settings.sendgrid ? sendgrid : 
                null;

            if (sendMethod){
                for (let recipient of settings.recipients){
                    let result = await sendMethod(recipient, subject, message);
                    this.logInfo(`Sent email to ${recipient} for process ${this.name} with result : ${result}` );
                }
            }
        }

    }
}

module.exports = {
    
    cronJobs,

    start : ()=>{
        for (const job of settings.jobs){
            const cronjob = new CronProcess(job.name, job.url, job.interval, job.expect, job.test, job.args );
            cronJobs.push(cronjob);
            cronjob.start();
        }
    }
}
