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
if (!settings.smtp)
    console.log('WARNING - no SMTP config found, emails will not be sent');

if (settings.smtp){
    if (settings.smtp.server  === undefined)
        console.log('settings.json is missing expected value for "settings.smtp.server"');

    if (settings.smtp.port === undefined)
        console.log('settings.json is missing expected value for "settings.smtp.port"');

    if (settings.smtp.secure === undefined)
        console.log('settings.json is missing expected value for "settings.smtp.secure"');
}

settings.recipients = settings.recipients || [];
if (typeof settings.recipients === 'string')
    settings.recipients = [settings.recipients];

settings.emailSubject = settings.emailSubject || 'Service failure'

if (!settings.fromEmail)
    console.log('WARNING - from email not set');

settings.fromEmail = settings.fromEmail || 'noreplay@example.com'

if (!settings.jobs) 
    console.log('WARNING - no jobs set');

settings.jobs = settings.jobs || [];
settings.port = settings.port || 3000;
settings.failCode = settings.failCode || 450;
settings.logPath = settings.logPath || './logs'

// remove jobs with missing properties or names which cannot be written to filesystem
const jobCount = settings.jobs.length;
settings.jobs = settings.jobs.filter((job)=>{
    let safe = sanitize(job.name) === job.name;
    if (!safe)
        console.log(`WARNING - ${job.name} is not filesystem-compatible, this job cannot be loaded.`);
        
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