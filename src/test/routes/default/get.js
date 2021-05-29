describe('routes/default/get', async()=>{

    it('routes/default/get::happy', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ dashboards : { test :{ default: true } }})

        const route = ctx.express.getRoute(_$+'routes/default')
        route(ctx.express.req, ctx.express.res)
    })

    it('routes/default/get::force first', async() => {
        const ctx =  require(_$t+'context')
        ctx.settings({ dashboards : { test :{ default: false } }})

        const route = ctx.express.getRoute(_$+'routes/default')
        route(ctx.express.req, ctx.express.res)
    })
})