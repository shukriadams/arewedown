/**
 * Required scopes : channels:read, groups:read, mpim:read, im:read
 */
module.exports = {

    /**
     * Sends a test slack message to the testChannel.
     */
    async test(){
        const settings = require('./settings').get(),
            slackConfig = settings.transports.slack

        if(!slackConfig)
            throw 'Test failed - Slack is not defined as a transport in settings, or is disabled.'

        if (!slackConfig.testChannel)
            throw 'Test failed - Slack transport config must have a "testChannel" property set to the Id of a user or channel to post a test message to.'

        const Slack = this.getClient(),
            message = 'Test message to verify slack settings work',
            slack = new Slack({
                signingSecret: slackConfig.secret,
                token: slackConfig.token
            })

        try {
            const postResult = await slack.client.chat.postMessage({
                    token: slackConfig.token,
                    channel: slackConfig.testChannel,
                    attachments : [
                        {
                            fallback : message,
                            title : message
                        }
                    ]                    
                })

            return (`Posting to Slack succeeded : ${postResult}`)

        } catch (ex){
            if (ex.data && ex.data.error === 'not_in_channel')
                throw `Please add your app to the target channel`

            throw ex
        }       
    },


    /**
     * 
     */
    async send(receiverTransmissionConfig, delta, message){
        const settings = require('./settings').get(),
            log = require('./../lib/logger').instance(),
            slackConfig = settings.transports.slack,
            Slack = this.getClient(),
            slack = new Slack({
                signingSecret: slackConfig.secret,
                token: slackConfig.token
            })

        try {
            const postresult = await slack.client.chat.postMessage({
                    token: slackConfig.token,
                    channel: receiverTransmissionConfig, // user id or channel id
                    attachments : [
                        {
                            fallback : message,
                            color : delta.actualFailingCount.length ? '#D92424' : '#007a5a',
                            title : message
                        }
                    ]                    
                })

            log.debug('postresult', postresult)
            return postresult

        } catch (ex){
            if (ex.data && ex.data.error === 'not_in_channel')
                throw `Please add your app to the target channel`

            throw ex
        }
    },


    /**
     * Deletes a message based on its slack api timestamp.
     * 
     */
    async delete(target, ts){
        const settings = require('./settings').get(),
            slackConfig = settings.transports.slack,
            Slack = this.getClient(),
            slack = new Slack({
                signingSecret: slackConfig.secret,
                token: slackConfig.token
            })

        return await slack.client.chat.delete({
            token: slackConfig.token,
            channel: target, 
            ts
        })
    },


    /**
     * 
     */
    async ensureSettingsOrExit(){
        const settings = require('./settings').get(),
            log = require('./../lib/logger').instance(),
            slackConfig = settings.transports.slack,
            Slack = this.getClient(),
            slack = new Slack({
                signingSecret: slackConfig.secret,
                token: slackConfig.token
            })

        log.info(`Confirming slack settings ...`)

        try {

            const result = await slack.client.conversations.list({
                token: slackConfig.token
            })
            
            if (!result.ok)
                throw {
                    message : 'Connection succeeded, but no conversations could be read.',
                    result
                }

            console.log('slack connection test succeeded.')

        } catch (ex){
            if (ex.message === 'invalid_auth')
                throw { message : 'Your slack token was rejected by Slack. Please use a valid token.' }
            else
                throw { message : 'slack connection test failed. ', ex }
        }
    },


    /**
     * Factory method to get a slack client. Under normal operation returns the "live" slack/bolt client, but for dev/testing
     * can return a mock of this
     */
    getClient(){
        const settings = require('./settings').get(),
            Slack = require('@slack/bolt').App

        return settings.transports.slack.mock ? 
            class SlackMock{
                constructor(){
                    
                    // we don't need istanbul coverage for any mock content
                    /* istanbul ignore next */
                    this.client = {
                        conversations : {
                            async list(){
                                return {
                                    ok : true
                                }
                            }
                        },
                        chat : {
                            async postMessage(args){
                                console.log(`mock slack message post :`)
                                console.log(args)
            
                                return {
                                    result : 'mock slack message post',
                                    ts : 12345
                                }
                            },
                            
                            async delete(){
                                console.log('mock slack message delete')
                            }
                        }
                    }
                }
            } : Slack
    }
}
