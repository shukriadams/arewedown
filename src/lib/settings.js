let fs = require('fs-extra'),
    jsonfile = require('jsonfile'),
    sanitize = require('sanitize-filename'),
    settings = {},
    settingsFile = './settings.json';

if (fs.existsSync(settingsFile))
    settings = jsonfile.readFileSync(settingsFile);
else
    console.log('settings.json not found, reverting to default settings');

// enforce settings structure
if (!settings.smtp && !settings.sendgrid)
    console.log('WARNING - no SMTP or SENDGRID config found, emails will not be sent');

if (settings.smtp){
    if (settings.smtp.server  === undefined)
        console.log('settings.json is missing expected value for "settings.smtp.server"');

    if (settings.smtp.port === undefined)
        console.log('settings.json is missing expected value for "settings.smtp.port"');

    if (settings.smtp.secure === undefined)
        console.log('settings.json is missing expected value for "settings.smtp.secure"');
}

if (settings.sendgrid){
    if (settings.sendgrid.key === undefined)
        console.log('settings.json is missing expected value for "settings.sendgrid.key"');
}

settings.recipients = settings.recipients || [];
if (typeof settings.recipients === 'string')
    settings.recipients = [settings.recipients];

settings.emailSubject = settings.emailSubject || 'Service failure'

if (!settings.fromEmail)
    console.log('WARNING - from email not set');

settings.fromEmail = settings.fromEmail || 'noreplay@example.com'

if (!settings.jobs) 
    console.log('WARNING - no jobs set, nothing will be monitored.');

settings.jobs = settings.jobs || [];
settings.port = settings.port || 3000;
settings.clientRefreshInterval = settings.clientRefreshInterval || 10000; 
settings.partialFailCode = settings.partialFailCode || 230;
settings.logPath = settings.logPath || './logs'

// remove jobs with missing properties or names which cannot be written to filesystem
const jobCount = settings.jobs.length;
settings.jobs = settings.jobs.filter((job)=>{
    let safe = sanitize(job.name) === job.name;
    if (!safe)
        console.log(`WARNING - ${job.name} is not filesystem-compatible, this job cannot be loaded.`);
    
    if (!job.test && !job.url){
        safe = false
        console.log(`WARNING - ${job.name} specifies no test, yet has no url, this job cannot be loaded.`);
    }
        
    return !!job.url && !!job.interval && !!job.name && safe
});

if (jobCount !== settings.jobs.length)
    console.log('WARNING - jobs with missing names, urls or interval were removed. Please ensure that all jobs are properly configured');

// ensure that job name can be written to filesystem
for(let job of settings.jobs){
    let sanitized = sanitize(job.name);
    if (sanitized !== job.name){
        console.log(`WARNING - ${job.name} cannot be written to filesystem, and will be changed to ${sanitized}`);
        job.name = sanitized;
    }
}


module.exports = settings;