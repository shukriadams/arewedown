describe('routes/status/get', async()=>{

    it('routes/status/get::happy', async() => {
        const ctx =  require(_$t+'context')
        
        ctx.inject.overwriteObject('./../lib/daemon', {
            watchers : [ { isPassing : true, config : { __hasErrors : false} }]
        })
        const status = ctx.express.getRoute(_$+'routes/status')
        status(ctx.express.req, ctx.express.res)
    })

})