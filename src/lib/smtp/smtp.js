



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
    async send(receiverTransmissionConfig, delta, text){
        const to = receiverTransmissionConfig, // smtp receiver config is a single string containing email address
            settings = require('./../settings').get(),
            smtpConfig = settings.transports.smtp,
            client = this.getClient(smtpConfig),
            subject = delta.actualFailingCount ? `WARNING : ${delta.actualFailingCount} watchers are failing` : 'SUCCESS : All watchers are passing'

        const response = await client.send(to, smtpConfig.from, subject, text)
        return {
            result : 'mail sent.',
            response
        }
    },


    /**
     * Sends a test email to the given received. This can be used to independently test SMTP configuration and
     * transmission 
     * 
     * @param receiverTransmissionConfig {object} : recipient config for this transmission.
     *        For SMTP this is always a flat "to" email address.
     */
    async test(receiverTransmissionConfig){
        const settings = require('./../settings').get(),
            smtpConfig = settings.transports.smtp,
            client = this.getClient(smtpConfig),            
            content = `Testing your SMTP connection from AREWEDOWN`,
            result = await client.send(receiverTransmissionConfig, smtpConfig.from,`Subject : AREWEDOWN? test`, content)
        
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
     * Basic self-test of SMTP connection settings, invoked on app start. This does not send mails, 
     * it connects with the given credentials. Use the "test" function on this class for detailed testing.
     */
    async validateSettings(){
        const settings = require('./../settings').get(),
            log = require('./../logger').instance(),
            smtpConfig = settings.transports.smtp,
            client = this.getClient(smtpConfig)
            
        log.info(`Confirming smtp settings by connecting to "${smtpConfig.server}".`)

        try {
            await client.test()
            console.log('smtp connection test succeeded.')
        } catch (ex){
            throw { text : 'smtp connection test failed. Please confirm smtp settings are valid.', ex }
        }        
    },


    /**
     * Factory method to get a slack client. Under normal operation returns the "live" slack/bolt client, but for dev/testing
     * can return a mock of this
     */
    getClient(options){
        const settings = require('./../settings').get(),
            SMTPMockClient = require('./smtpMockClient'),
            SMTPClient = require('./smtpClient')

        return settings.transports.smtp.mock ? 
            new SMTPMockClient() :
            new SMTPClient(options)
    }
}