describe('lib/slack', async()=>{
    
    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.settings({ transports : { slack : { token : 'token', secret : 'secret' } } })
        ctx.inject.object('@slack/bolt', {
            App : class {
                client = {
                    conversations : {
                        list (){
                            return { ok : true }
                        }
                    },
                    chat : {
                        postMessage(){
                            return {}
                        },
                        delete(){
                            return { ok : true}
                        }
                    }
                }
            }
        })

        return ctx
    }

    it('lib/slack/validateSettings:happy', async()=>{
        const ctx = createTestStructures(),
            slack = ctx.clone(require(_$+'lib/slack'))

        await slack.validateSettings()
    })

    it('lib/slack/validateSettings:coverage conversation not ok', async()=>{
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
        await ctx.assert.throws(async() => await slack.validateSettings() )
    })

    it('lib/slack/validateSettings:coverage conversation throws generic error', async()=>{
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
        await ctx.assert.throws(async() => await slack.validateSettings() )
    })

    it('lib/slack/validateSettings:coverage conversation throws auth error', async()=>{
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

        const slack = require(_$+'lib/slack')
        await ctx.assert.throws(async() => await slack.validateSettings() )
    })


    
    it('lib/slack/send:happy', async()=>{
        createTestStructures()
        const slack = require(_$+'lib/slack')
        await slack.send('slackid', { failingDelta : [], passingDelta: [], actualFailingCount: [] })
    })

    it('lib/slack/send:unhappy throws generic error', async()=>{
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
        const ex = await ctx.assert.throws(async() => await slack.send('slackid', { failingDelta : [], passingDelta: [], failingOther: [], actualFailingCount : [] }))
        ctx.assert.equal(ex, 'error')
    })

    it('lib/slack/send:unhappy throws not_in_channel error', async()=>{
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
        
        const slack = require(_$+'lib/slack')
        await ctx.assert.throws(async() => await slack.send('slackid', { failingDelta : [], passingDelta: [], failingOther: [], actualFailingCount : [] }) )
    })

    it('lib/slack/delete:happy', async()=>{
        const ctx = createTestStructures(),
            slack = ctx.clone(require(_$+'lib/slack'))

        const result = await slack.delete()
        ctx.assert.true(result.ok)
    }) 

})