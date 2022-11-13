describe('routes/status/get', async()=>{

    it('routes/status/get::happy', async() => {
        const ctx =  require(_$t+'context')
        
        ctx.inject.object('./../lib/daemon', {
            watchers : [ { status : 'up', config : { __hasErrors : false} }]
        })
        
        const route = ctx.express.captureRoutes(_$+'routes/status', '/status')
        route(ctx.express.req, ctx.express.res)
    })

    it('routes/status/get::unhappy::cover', async() => {
        let ctx =  require(_$t+'context')
            call = 0

        ctx.express.res.json = ()=>{
            if (call === 0){
                call ++
                throw 'fail on 1st call'
            }
        }

        const route = await ctx.express.captureRoutes(_$+'routes/status', '/status')
        route(ctx.express.req, ctx.express.res)
    })

})