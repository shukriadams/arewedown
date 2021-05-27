describe('routes/content/get', async()=>{

    it('routes/content/get::happy', async() => {
        const ctx =  require(_$t+'context'),
            content = ctx.express.getRoute(_$+'routes/content')

        content(ctx.express.req, ctx.express.res)
    })

    it('routes/content/get::unhappy::throws exception', async() => {
        const ctx =  require(_$t+'context'),
            content = ctx.express.getRoute(_$+'routes/content')

        ctx.express.res.download = ()=>{ throw 'error' }
        content(ctx.express.req, ctx.express.res)
    })
})