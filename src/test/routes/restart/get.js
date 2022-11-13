describe('routes/exit/get', async()=>{

    it('routes/exit/get::happy', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ UIRestart: true })
        ctx.inject.object('process', { exit() {} })

        const route = ctx.express.captureRoutes(_$+'routes/restart')
        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/exit/get::exit blocked', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ UIRestart: false })

        const route = ctx.express.captureRoutes(_$+'routes/restart')
        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/exit/get::throws exception', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ UIRestart: true })
        ctx.inject.object('process', { exit() { throw 'error' }})

        const route = ctx.express.captureRoutes(_$+'routes/restart')
        await route(ctx.express.req, ctx.express.res)
    })

})