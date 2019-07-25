const CronJob = require('cron').CronJob,
    request = require('request');
    fs = require('fs-extra'),
    Logger = require('winston-wrapper');

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

            this.lastRun = new Date();

        } catch(ex){
            this.logError(ex);
            console.log(ex);
            console.log('failed');
            this.isPassing = false;
            this.errorMessage = ex;
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

    start : (jobs)=>{
        for (const job of jobs){
            const cronjob = new CronProcess(job.name, job.url, job.interval, job.expect, job.test );
            cronJobs.push(cronjob);
            cronjob.start();
        }
    }
}
