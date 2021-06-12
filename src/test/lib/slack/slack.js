describe('lib/slack', async()=>{
    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.settings({ transports : { slack : { token : 'token', secret : 'secret' } } })
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    conversations : {
                        list (){
                            return {
                                ok : true
                            }
                        }
                    },
                    chat : {
                        postMessage(){
                            return {}
                        }
                    }
                }
            }
        })

        return ctx
    }

    it('lib/smtp/slack/ensureSettingsOrExit:happy', async()=>{
        const ctx = createTestStructures(),
            slack = ctx.clone(require(_$+'lib/slack'))

        await slack.ensureSettingsOrExit()
    })

    it('lib/smtp/slack/ensureSettingsOrExit:coverage conversation not ok', async()=>{
        const ctx = createTestStructures()
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    conversations :{
                        list (){
                            return {
                                ok : false
                            }
                        }
                    }
                }
            }
        })

        const slack = ctx.clone(require(_$+'lib/slack'))
        await ctx.assert.throws(async() => await slack.ensureSettingsOrExit() )
    })

    it('lib/smtp/slack/ensureSettingsOrExit:coverage conversation throws generic error', async()=>{
        const ctx = createTestStructures()
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    conversations :{
                        list (){
                            throw 'error'
                        }
                    }
                }
            }
        })

        const slack = ctx.clone(require(_$+'lib/slack'))
        await ctx.assert.throws(async() => await slack.ensureSettingsOrExit() )
    })

    it('lib/smtp/slack/ensureSettingsOrExit:coverage conversation throws auth error', async()=>{
        const ctx = createTestStructures()
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    conversations :{
                        list (){
                            throw {
                                message : 'invalid_auth'
                            }
                        }
                    }
                }
            }
        })

        const slack = ctx.clone(require(_$+'lib/slack'))
        await ctx.assert.throws(async() => await slack.ensureSettingsOrExit() )
    })


    
    it('lib/smtp/slack/send:happy', async()=>{
        const ctx = createTestStructures(),
            slack = ctx.clone(require(_$+'lib/slack'))

        await slack.send('slackid', 'mywatcher', true)
    })

    it('lib/smtp/slack/send:unhappy throws generic error', async()=>{
        const ctx = createTestStructures()
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    chat : {
                        postMessage(){
                            throw 'error'
                        }
                    }
                }
            }
        })
        
        const slack = ctx.clone(require(_$+'lib/slack'))

        await slack.send('slackid', 'mywatcher', true)
    })

    it('lib/smtp/slack/send:unhappy throws not_in_channel error', async()=>{
        const ctx = createTestStructures()
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    chat : {
                        postMessage(){
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
        
        const slack = ctx.clone(require(_$+'lib/slack'))
        await ctx.assert.throws(async() => await slack.send('slackid', 'mywatcher', true) )
        
    })
})