describe('routes/default/get', async()=>{

    // coverage only
    it('routes/default/get::happy', async() => {
        const ctx =  require(_$t+'context')
        const route = ctx.express.captureRoutes(_$+'routes/default')
        await route(ctx.express.req, ctx.express.res)
    })
})