const settings = require('./settings'),
    process = require('process'),
    log = require('./../lib/logger').instance()

module.exports = { 
    async send(to, subject, message){
        let smtpConfig = settings.transports.smtp,
            SMTPClient = require('smtp-client').SMTPClient,
            client = new SMTPClient({
                host: smtpConfig.server,
                secure: smtpConfig.secure,
                port: smtpConfig.port
            }),
            mailContent = 
                `From : ${smtpConfig.from}\n` +
                `Subject : ${subject}\n` +
                `To: ${to}\n` +
                `\n` +
                `${message}`

        try {
            await client.connect()
            await client.greet({hostname: smtpConfig.server })
            await client.authPlain({username: smtpConfig.user, password: smtpConfig.pass })
            await client.mail({from: smtpConfig.from })
            await client.rcpt({ to })
            await client.data(mailContent)
            await client.quit()
            return {
                result : 'mail sent'
            }
        } catch (ex){
            log.error(ex)
        }
    },
    
    async ensureSettingsOrExit(){
        
        let smtpConfig = settings.transports.smtp,
            SMTPClient = require('smtp-client').SMTPClient,
            client = new SMTPClient({
                host: smtpConfig.server,
                secure: smtpConfig.secure,
                port: smtpConfig.port
            })
            
        log.info(`Confirming stmp settings by connecting to "${smtpConfig.server}"`)

        try {
            await client.connect()
            await client.greet({hostname: smtpConfig.server })
            await client.authPlain({username: smtpConfig.user, password: smtpConfig.pass })
            await client.quit()
            console.log('Stmp connection succeeded : settings validated')
        } catch (ex){
            log.error('smtp connection test failed', ex)
            process.exit(1)
        }        
    }
}