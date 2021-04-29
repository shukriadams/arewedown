const settings = require('./settings'),
    process = require('process'),
    log = require('./../lib/logger').instance()

module.exports = { 
    async send(to, subject, message){
        let SMTPClient = require('smtp-client').SMTPClient,
            client = new SMTPClient({
                host: settings.smtp.server,
                secure: settings.smtp.secure,
                port: settings.smtp.port
            }),
            mailContent = 
                `From : ${settings.smtp.from}\n` +
                `Subject : ${subject}\n` +
                `To: ${to}\n` +
                `\n` +
                `${message}`

        await client.connect()
        await client.greet({hostname: settings.smtp.server })
        await client.authPlain({username: settings.smtp.user, password: settings.smtp.pass })
        await client.mail({from: settings.smtp.from })
        await client.rcpt({ to })
        await client.data(mailContent)
        await client.quit()

        try {
            return await transporter.sendMail(mailOptions)
        } catch (ex){
            log.error.error(ex)
        }
    },
    async ensureSettingsOrExit(){
        console.log(`Confirming stmp settings by connecting to "${settings.smtp.server}"`)
        let SMTPClient = require('smtp-client').SMTPClient,
            client = new SMTPClient({
                host: settings.smtp.server,
                secure: settings.smtp.secure,
                port: settings.smtp.port
            })

        try {
            await client.connect()
            await client.greet({hostname: settings.smtp.server })
            await client.authPlain({username: settings.smtp.user, password: settings.smtp.pass })
            await client.quit()
            console.log('Stmp connection succeeded : settings validated')
        } catch (ex){
            log.error.error('smtp connection test failed')
            log.error.error(ex)
            process.exit(1)
        }        
    }
}