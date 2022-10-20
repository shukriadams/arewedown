/**
 * Required scopes : channels:read, groups:read, mpim:read, im:read
 */

class SlackMock{
    constructor(){
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
}

module.exports = {

    async test(){
        throw 'not implemented'
    },

    summarizeWatcherList(list, verb, listCondenseThresh){
        if (!list.length)
            return ''
        
        if (list.length === 1)
            return `${list[0]} is ${verb}. `

        if (list.length > listCondenseThresh)
            return `${list.length} watchers are ${verb}. `
        
        return `${list.join(', ')} are ${verb}. `
    },

    async send(receiverTransmissionConfig, summary){
        const settings = require('./settings').get(),
            log = require('./../lib/logger').instance(),
            slackConfig = settings.transports.slack,
            Slack = this.getClient(),
            slack = new Slack({
                signingSecret: slackConfig.secret,
                token: slackConfig.token,
            })

        try {

            let text = this.summarizeWatcherList(summary.failing, 'failing', settings.listCondenseThresh)
            text += this.summarizeWatcherList(summary.passing, 'up again', settings.listCondenseThresh)
            text = text.trim()

            const postresult = await slack.client.chat.postMessage({
                    token: slackConfig.token,
                    channel: receiverTransmissionConfig, // user id or channel id
                    text : text,
                    attachments : [
                        {
                            fallback : text,
                            color : summary.failing.length ? '#D92424' : '#007a5a',
                            title : text
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
                token: slackConfig.token,
            })

        return await slack.client.chat.delete({
            token: slackConfig.token,
            channel: target, 
            ts
        })
    },

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

        return settings.transports.slack.mock ? SlackMock : Slack
    }
}
