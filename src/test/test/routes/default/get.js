describe('routes/default/get', async()=>{

    it('routes/default/get::happy', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.overwriteObject('./../lib/settings', { dashboards : { test :{ default: true } }})

        const defaultRoute = ctx.express.getRoute(_$+'routes/default')
        defaultRoute(ctx.express.req, ctx.express.res)
    })

    it('routes/default/get::force first', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.overwriteObject('./../lib/settings', { dashboards : { test :{ default: false } }})

        const defaultRoute = ctx.express.getRoute(_$+'routes/default')
        defaultRoute(ctx.express.req, ctx.express.res)
    })
})