describe('routes/dashboard/get', async()=>{

    it('routes/dashboard/get::happy', async() => {
        const ctx =  require(_$t+'context'),
            daemon =  require(_$+'lib/daemon'),
            dashboard = ctx.express.getRoute(_$+'routes/dashboard')

        // stub out cron or it will spawn actual threads
        ctx.inject.object('cron', {
            CronJob : class { 
                nextDates(){ return '' }
            }
        })

        await daemon.start()
        dashboard(ctx.express.req, ctx.express.res)
    })

    it('routes/dashboard/get::invalid dashboard', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('./settings', { dashboards : null })
        ctx.express.req.params.dashboard = 'bogusdashboard'
        const dashboard = ctx.express.getRoute(_$+'routes/dashboard')
        
        dashboard(ctx.express.req, ctx.express.res)
    })

    
    it('routes/dashboard/get::throws error', async() => {
        const ctx =  require(_$t+'context')
        ctx.express.res.send =()=>{ throw 'error'}
        const dashboard = ctx.express.getRoute(_$+'routes/dashboard')
        dashboard(ctx.express.req, ctx.express.res)
    })
})