class SMTPMock {

    async connect(){
        console.log('SMPT Mock : connecting')
    }

    async greet(){
        console.log('SMPT Mock : greeting')
    }

    async authPlain(){
        console.log('SMPT Mock : authPlain')
    }

    async data(content){
        console.log(`SMPT Mock : sending data\n${JSON.stringify(content)}`)
    }

    async quit(){
        console.log('SMPT Mock : quiting')
    }

    async mail(from){
        console.log(`SMPT Mock : setting from email\n${from}`)
    }

    async rcpt(to){
        console.log(`SMPT Mock : setting to email\n${JSON.stringify(to)}`)
    }
}

module.exports = { 


    /*
    * @param receiverTransmissionConfig {object} : recipient config for this transmission.
    *        For SMTP this is always a flat "to" email address.
    * @param delta {object} : summary of change : 
    *     {
    *         failing: [string] : names of failed watchers since last message transmission,
    *         passing: [string] : names of passing watchers since last message transmission,
    *         actualPassingCount : actual count of watchers currently passing
    *         actualFailingCount : actual count of watchers currently failing
    *     }
    * @param text {string} : message to send to user summarizing the contents of delta object
    */
    async  _send(receiverTransmissionConfig, delta, text){
        let to = receiverTransmissionConfig, // smtp receiver config is a single string containing email address
            settings = require('./settings').get(),
            smtpConfig = settings.transports.smtp,
            SMTPClient = this.getClient(),
            client = new SMTPClient({
                host: smtpConfig.server,
                secure: smtpConfig.secure,
                port: smtpConfig.port
            }),
            subject = delta.actualFailingCount ? `WARNING : ${delta.actualFailingCount} watchers are failing` : 'SUCCESS : All watchers are passing',
            mailContent = `From : ${smtpConfig.from}\n` +
                `Subject : ${subject}\n` +
                `To: ${to}\n` +
                `\n` +
                `${text}`,
            response = ''

        response += `connect:`+await client.connect()
        response += `greet:`+await client.greet({ hostname: smtpConfig.server })
        response += `authPlain:`+await client.authPlain({ username: smtpConfig.user, password: smtpConfig.pass })
        await client.mail({ from: smtpConfig.from })
        await client.rcpt({ to })
        response += `data:`+await client.data(mailContent)
        response += `quit:`+await client.quit()

        return {
            result : 'mail sent.',
            response
        }
    },


    /**
     * Sends a test email to the given received. This can be used to independently test SMTP configuratio and
     * transmission 
     * 
     * @param receiverTransmissionConfig {object} : recipient config for this transmission.
     *        For SMTP this is always a flat "to" email address.
     */
    async test(receiverTransmissionConfig){
        const settings = require('./settings').get(),
            smtpConfig = settings.transports.smtp
            content = `From : ${smtpConfig.from}\n` +
                `Subject : AREWEDOWN? test` +
                `To: ${receiverTransmissionConfig}\n` +
                `\n` +
                `Testing your SMTP connection from AREWEDOWN`

        const result = await this._send(receiverTransmissionConfig, content)
        
        return `Email sent to ${receiverTransmissionConfig}\n` + 
            `\n\n` +   
            `Email content : \n` +  
            `${content}\n` +
            `\n\n` +   
            `Output was : \n` +  
            `${JSON.stringify(result)}\n` +
            `\n\n` + 
            `Don't forget to check spam filters etc.`
    },


    /**
     * Sends a passing/failing email. This is called by the watcher when its passing status changes.
     * 
     * @param receiverTransmissionConfig {object} : recipient config for this transmission. 
     *        For SMTP this is always a flat "to" email address.
     * @param object {string} : watcher to report status on
     */
    async send(receiverTransmissionConfig, delta, text){
        this._send(receiverTransmissionConfig, delta, text)
    },


    /**
     * Basic self-test of SMTP connection settings, invoked on app start. This does not send mails, 
     * it connects with the given credentials. Use the "test" function on this class for detailed testing.
     */
    async ensureSettingsOrExit(){
        const settings = require('./settings').get(),
            log = require('./../lib/logger').instance(),
            smtpConfig = settings.transports.smtp,
            SMTPClient = this.getClient(),
            client = new SMTPClient({
                host: smtpConfig.server,
                secure: smtpConfig.secure,
                port: smtpConfig.port
            })
            
        log.info(`Confirming smtp settings by connecting to "${smtpConfig.server}".`)

        try {
            await client.connect()
            await client.greet({ hostname: smtpConfig.server })
            await client.authPlain({ username: smtpConfig.user, password: smtpConfig.pass })
            await client.quit()
            
            console.log('smtp connection test succeeded.')
        } catch (ex){
            throw { text : 'smtp connection test failed. Please confirm smtp settings are valid.', ex }
        }        
    },


    /**
     * Factory method to get a slack client. Under normal operation returns the "live" slack/bolt client, but for dev/testing
     * can return a mock of this
     */
    getClient(){
        const settings = require('./settings').get(),
            smtpClient = require('smtp-client').SMTPClient

        return settings.transports.smtp.mock ? SMTPMock : smtpClient
    }
}