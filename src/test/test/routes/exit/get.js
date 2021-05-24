describe('routes/exit/get', async()=>{

    it('routes/exit/get::happy', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ allowHttpExit: true })
        ctx.inject.overwriteObject('process', { exit() {} })

        const exit = ctx.express.getRoute(_$+'routes/exit')
        exit(ctx.express.req, ctx.express.res)
    })

    it('routes/exit/get::exit blocked', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ allowHttpExit: false })

        const exit = ctx.express.getRoute(_$+'routes/exit')
        exit(ctx.express.req, ctx.express.res)
    })

    it('routes/exit/get::throws exception', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ allowHttpExit: true })
        ctx.inject.overwriteObject('process', { exit() { throw 'error' }})

        const exit = ctx.express.getRoute(_$+'routes/exit')
        exit(ctx.express.req, ctx.express.res)
    })

})