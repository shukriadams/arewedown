module.exports = { 


    /**
     * Generates an email string specifc to what the "smtp-client" plugin expects. This email is used to alert
     * that a given watcher process is either passing or failing.
     * 
     * @param isPassing {boolean} : True if test is passing. Content is always specific to pass/fail scenarios
     * @param to {string} : Email address of recipient
     * @param watcherName {string} : Human-friendly name of watcher process that is passing/failing
     */
    generateContent(isPassing, to, watcherName){
        const settings = require('./settings').get(),
            smtpConfig = settings.transports.smtp,
            subject = isPassing ? `SUCCESS: ${watcherName} is up` : `WARNING: ${watcherName} is down`,
            message = isPassing ? `${watcherName} is up` : `${watcherName} is down`

        return `From : ${smtpConfig.from}\n` +
            `Subject : ${subject}\n` +
            `To: ${to}\n` +
            `\n` +
            `${message}`
    },


    /*
    * @param receiverTransmissionConfig {object} : recipient config for this transmission.
    *        For SMTP this is always a flat "to" email address.
    * @param watcherName {string} : watcher to report status on
    * @param isPassing {boolean} : true if watch is passing
    */
    async  _send(receiverTransmissionConfig, mailContent){
        const to = receiverTransmissionConfig, // smtp receiver config is a single string containing email address
            settings = require('./settings').get(),
            smtpConfig = settings.transports.smtp,
            SMTPClient = require('smtp-client').SMTPClient,
            client = new SMTPClient({
                host: smtpConfig.server,
                secure: smtpConfig.secure,
                port: smtpConfig.port
            })

        let response = ''
        response += `connect:`+await client.connect()
        response += `greet:`+await client.greet({hostname: smtpConfig.server })
        response += `authPlain:`+await client.authPlain({username: smtpConfig.user, password: smtpConfig.pass })
        await client.mail({from: smtpConfig.from })
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
     * @param watcherName {string} : watcher to report status on
     * @param isPassing {boolean} : true if watch is passing
     */
    async send(receiverTransmissionConfig, watcherName, isPassing){
        const mailContent = this.generateContent(isPassing, receiverTransmissionConfig, watcherName)
        this._send(receiverTransmissionConfig, mailContent)
    },
    

    /**
     * Basic self-test of SMTP connection settings, invoked on app start. This does not send mails, 
     * it connects with the given credentials. Use the "test" function on this class for detailed testing.
     */
    async ensureSettingsOrExit(){
        const settings = require('./settings').get(),
            log = require('./../lib/logger').instance(),
            smtpConfig = settings.transports.smtp,
            SMTPClient = require('smtp-client').SMTPClient,
            client = new SMTPClient({
                host: smtpConfig.server,
                secure: smtpConfig.secure,
                port: smtpConfig.port
            })
            
        log.info(`Confirming smtp settings by connecting to "${smtpConfig.server}".`)

        try {
            await client.connect()
            await client.greet({hostname: smtpConfig.server })
            await client.authPlain({username: smtpConfig.user, password: smtpConfig.pass })
            await client.quit()
            
            console.log('smtp connection test succeeded.')
        } catch (ex){
            throw { text : 'smtp connection test failed. Please confirm smtp settings are valid.', ex }
        }        
    }
}