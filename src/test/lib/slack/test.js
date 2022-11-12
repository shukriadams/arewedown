describe('lib/slack/test', async()=>{

    it('lib/slack/test::happy', async()=>{
        const ctx = require(_$t+'context')
        ctx.settings({ transports : { slack : { testChannel : 'mychannel',  token : 'token', secret : 'secret' } } })
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    chat : {
                        postMessage (){ }
                    }
                }
            }
        })

        const slack = require(_$+'lib/slack'),
            result = await slack.test()

        ctx.assert.includes(result, 'Posting to Slack succeeded')
    })

    it('lib/slack/test::unhappy::no slack config', async()=>{
        const ctx = require(_$t+'context')

        // ensure no slack in settings
        ctx.settings({ transports : { } })

        const slack = require(_$+'lib/slack'),
            error = await ctx.assert.throws(async() => await slack.test() )    

        ctx.assert.includes(error, 'Slack is not defined as a transport')
    })

    it('lib/slack/test::unhappy::no testChannel', async()=>{
        const ctx = require(_$t+'context')

        // ensure no slack testChannel in settings
        ctx.settings({ transports : { slack : { token : 'token', secret : 'secret' } } })

        const slack = require(_$+'lib/slack'),
            error = await ctx.assert.throws(async() => await slack.test() )    

        ctx.assert.includes(error, 'Slack transport config must have a "testChannel" property')
    })

    it('lib/slack/test::cover::not_in_channel error', async()=>{
        const ctx = require(_$t+'context')
        ctx.settings({ transports : { slack : { testChannel : 'mychannel',  token : 'token', secret : 'secret' } } })

        const slack = require(_$+'lib/slack')

        // override slack client, force exception on postMessage() method
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    chat : {
                        postMessage (){ 
                            throw { 
                                data : {
                                    error : 'not_in_channel'
                                }
                            }                             
                        }
                    }
                }
            }
        })

        const error = await ctx.assert.throws(async() => await slack.test() )
        ctx.assert.includes(error, 'add your app to the target')
    })

    it('lib/slack/test::cover::unexpected error', async()=>{
        const ctx = require(_$t+'context')
        ctx.settings({ transports : { slack : { testChannel : 'mychannel', token : 'token', secret : 'secret' } } })

        const slack = require(_$+'lib/slack')

        // override slack client, force exception on postMessage() method
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    chat : {
                        postMessage (){ 
                            throw 'forced error'
                        }
                    }
                }
            }
        })

        const error = await ctx.assert.throws(async() => await slack.test() )
        ctx.assert.includes(error, 'forced error')
    })

})