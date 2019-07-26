let fs = require('fs-extra'),
    jsonfile = require('jsonfile'),
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

module.exports = settings;