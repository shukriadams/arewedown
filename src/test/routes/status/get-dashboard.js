describe('routes/status/get', async()=>{
    
    const createTestStructures = () =>{
        const ctx = require(_$t+'context')
        
        ctx.settings({ 
            dashboards: { default: { watchers: 'mywatcher' } },
            watchers : {
                mywatcher: {}
            }
        })

        // status reads state of watchers on daemon, fake one here
        ctx.inject.object('./../lib/daemon', {
            watchers : [ { 
                status : 'up', 
                config : { __id: 'mywatcher', __hasErrors : false },
                calculateDisplayTimes(){}
            }]
        })
        
        ctx.express.req.params.dashboard = 'default'

        return ctx
    }

    it('routes/status/get/dashboard::happy', async() => {
        const ctx = createTestStructures(),
             route = ctx.express.captureRoutes(_$+'routes/status', '/status/dashboard/:dashboard')

        route(ctx.express.req, ctx.express.res)
    })

    it('routes/status/get/dashboard::unhappy::invalid dashboard', async() => {
        const ctx = createTestStructures()

        ctx.express.req.params.dashboard = 'random-invalid-dashboard-name'

        const route = ctx.express.captureRoutes(_$+'routes/status', '/status/dashboard/:dashboard')
        route(ctx.express.req, ctx.express.res)
    })

    it('routes/status/get/dashboard::unhappy::unexpected error', async() => {
        let ctx = createTestStructures(),
            call = 0 

        ctx.express.res.json=()=>{ 
            // fail on first call only
            if (call === 0){
                call ++
                throw 'forced error' 
            }
        }

        const route = ctx.express.captureRoutes(_$+'routes/status', '/status/dashboard/:dashboard')
        route(ctx.express.req, ctx.express.res)
    })

})