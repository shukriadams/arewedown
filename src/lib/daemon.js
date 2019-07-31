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
    constructor(config){

        this.config = config;
        this.logInfo = Logger.instance().info.info;
        this.logError = Logger.instance().error.error;
        this.isPassing = false;
        this.errorMessage = 'Checking has not run yet';
        this.busy = false;
        this.lastRun = new Date();
        this.nextRun = null;
        this.recipients = [];

        // recipients is optional. It is a list of strings which must correspond to "name" values in objects in settings.people array.
        if (!this.config.recipients)
            this.config.recipients = [];
            
        if (this.config.recipients && typeof this.config.recipients === 'string'){
            this.config.recipients = this.config.recipients.split(',');
        }


        for (let recipientName of this.config.recipients){
            let recipientObject = settings.people.find((r)=> { return r.name === recipientName ? r : null; });

            if (!recipientObject){
                this.logError(`Recipient name "${recipientName}" in job ${this.config.name} could not be matched to a recipient in settings. This person will not receive notifications.`);
                continue;
            }

            this.recipients.push(recipientObject);
        }

        this.calcNextRun();
    }

    calcNextRun(){
        if (this.cron){
            this.nextRun = new Date(this.cron.nextDates().toString());
        }
    }

    start(){
        
        this.logInfo('Starting service' + this.config.interval)

        this.cron = new CronJob(this.config.interval, async()=>{
            try
            {
                if (this.busy){
                    this.logInfo(`${this.config.name} check was busy from previous run, skipping`);
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

            if (this.config.test){
                try {
                    let test = require(`./../tests/${this.config.test}`);
                    let result = await test.call(this, this);
                    this.isPassing = result === true;
                } catch(ex){
                    this.logError(`Unhandled exception in user test ${this.config.test} : ${ex}`);
                    this.isPassing = false;
                    this.errorMessage = ex;
                }
            } else {
                // do a simple http get
                await httpHelper.downloadString(this.config.url);
            }


        } catch(ex){
            this.errorMessage = ex.errno === 'ENOTFOUND' || ex.errno === 'EAI_AGAIN' ? `${this.config.url} could not be reached.` :this.errorMessage = ex;
            this.isPassing = false;
        }

        this.calcNextRun();

        
        if (this.errorMessage)
            this.logInfo(this.errorMessage);

        let flag = path.join(flagFolder, this.config.name),
            statusChanged = false,
            historyLogFolder = path.join(flagFolder, `${this.config.name}_history`);

        if (this.isPassing){
            await fs.ensureDir(historyLogFolder);

            jsonfile.writeFileSync(path.join(historyLogFolder, `status.json`), {
                status : 'up',
                url : this.config.url,
                date : this.lastRun
            });

            if (await fs.exists(flag)){

                // site is back up after fail was previous detected, clean up flag and write log
                await fs.remove(flag);

                jsonfile.writeFileSync(path.join(historyLogFolder, `${this.lastRun.getTime()}.json`), {
                    status : 'up',
                    url : this.config.url,
                    date : this.lastRun
                });

                this.logInfo(`Status changed, flag removed for ${this.config.name}`);
                statusChanged = true;
            }
        } else {

            if (!await fs.exists(flag)){

                await fs.ensureDir(historyLogFolder);

                // site is down, write fail flag and log
                jsonfile.writeFileSync(flag, {
                    url : this.config.url,
                    date : new Date()
                });

                jsonfile.writeFileSync(path.join(historyLogFolder, `${this.lastRun.getTime()}.json`), {
                    status : 'down',
                    url : this.config.url,
                    date : new Date()
                });
                
                jsonfile.writeFileSync(path.join(historyLogFolder, `status.json`), {
                    status : 'down',
                    url : this.config.url,
                    date : this.lastRun
                });

                this.logInfo(`Status changed, flag created for ${this.config.name}`);
                statusChanged = true;
            }
        }

        // send email if site status has change changed
        if (statusChanged){

            let subject = this.isPassing ? `${this.config.name} is up` : `${this.config.name} is down`,
                message = this.isPassing ? `${this.config.name} is up` : `${this.config.name} is down`;

            let sendMethod = settings.smtp ? smtp :
                settings.sendgrid ? sendgrid : 
                null;

            if (sendMethod){
                for (let recipient of this.recipients){
                    // handle email
                    if (recipient.email){
                        let result = await sendMethod(recipient.email, subject, message);
                        this.logInfo(`Sent email to ${recipient.email} for process ${this.config.name} with result : ${result}` );
                    }

                    // handle slack
                }
            }
        }

    }
}

module.exports = {
    
    cronJobs,

    start : ()=>{
        for (const job of settings.jobs){
            const cronjob = new CronProcess(job);
            cronJobs.push(cronjob);
            cronjob.start();
        }
    }
}
