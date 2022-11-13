describe('routes/slack/get', async()=>{

    it('routes/slack/get::happy', async() => {
        const ctx =  require(_$t+'context')
        ctx.express.req.params.target = 'userid'
        ctx.inject.object('./../lib/slack', {
            send(){ 
                return { ts : 123 }
            },
            delete(){
                return { ok : true }
            }
        })
        
        const route = ctx.express.captureRoutes(_$+'routes/slack')
        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/slack/get::unhappy', async() => {
        const ctx =  require(_$t+'context')
        ctx.express.req.params.target = 'userid'
        ctx.inject.object('./../lib/slack', {
            send:()=>{ 
                return { ts : 123 }
            },
            delete(){
                return { ok : false }
            }
        })
        
        const route = ctx.express.captureRoutes(_$+'routes/slack')
        await route(ctx.express.req, ctx.express.res)
    })

})