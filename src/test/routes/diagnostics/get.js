describe('routes/diagnostics/get', async()=>{

    it('routes/diagnostics/get::happy', async() => {
        const ctx =  require(_$t+'context'),
            route = ctx.express.captureRoutes(_$+'routes/diagnostics')
        ctx.express.req.params.transport = 'smtp'
        ctx.express.req.params.recipient = 'myuser'

        await route(ctx.express.req, ctx.express.res)
    })


    it('routes/diagnostics/get::unhappy::no transport or recipient', async() => {
        const ctx =  require(_$t+'context'),
            route = ctx.express.captureRoutes(_$+'routes/diagnostics')

        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/diagnostics/get::unhappy::no recipient', async() => {
        const ctx =  require(_$t+'context'),
            route = ctx.express.captureRoutes(_$+'routes/diagnostics')

        ctx.express.req.params.transport = 'smtp'

        await route(ctx.express.req, ctx.express.res)
    })


    it('routes/diagnostics/get::unhappy::no transport', async() => {
        const ctx =  require(_$t+'context'),
            route = ctx.express.captureRoutes(_$+'routes/diagnostics')

        ctx.express.req.params.recipient = 'myuser'

        await route(ctx.express.req, ctx.express.res)
    })


    it('routes/diagnostics/get::unhappy::diagnostics disabled', async() => {
        const ctx =  require(_$t+'context')
        
        ctx.settings({ transports : { smtp : { server : 'server', port : 'port', secure : true, user: 'user', pass : 'pass', from : 'from', diagnostics: false  } } })

        const route = ctx.express.captureRoutes(_$+'routes/diagnostics')
        
        ctx.express.req.params.transport = 'smtp'
        ctx.express.req.params.recipient = 'myuser'

        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/diagnostics/get::unhappy::unexpected error', async() => {
        const ctx =  require(_$t+'context')
        
        ctx.settings({ 
            transports : { smtp : { server : 'server', port : 'port', secure : true, user: 'user', pass : 'pass', from : 'from', diagnostics: true  } },
            recipients : {
                myuser : 'mysmtpsetting'
            }

        })
        
        ctx.express.req.params.transport = 'smtp'
        ctx.express.req.params.recipient = 'myuser'

        ctx.inject.object('./smtp', {
            test:()=>{ 
                throw 'forced error'
            },
        })

        const route = ctx.express.captureRoutes(_$+'routes/diagnostics')
        await route(ctx.express.req, ctx.express.res)
    })
})