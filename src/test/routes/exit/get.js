describe('routes/exit/get', async()=>{

    it('routes/exit/get::happy', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ allowHttpExit: true })
        ctx.inject.overwriteObject('process', { exit() {} })

        const route = ctx.express.getRoute(_$+'routes/exit')
        route(ctx.express.req, ctx.express.res)
    })

    it('routes/exit/get::exit blocked', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ allowHttpExit: false })

        const route = ctx.express.getRoute(_$+'routes/exit')
        route(ctx.express.req, ctx.express.res)
    })

    it('routes/exit/get::throws exception', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ allowHttpExit: true })
        ctx.inject.overwriteObject('process', { exit() { throw 'error' }})

        const route = ctx.express.getRoute(_$+'routes/exit')
        route(ctx.express.req, ctx.express.res)
    })

})