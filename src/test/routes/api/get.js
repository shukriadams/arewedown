describe('routes/api/get', async()=>{

    it('routes/api/get::happy', async() => {
        const ctx =  require(_$t+'context'),
            route = ctx.express.captureRoutes(_$+'routes/api')

        await route(ctx.express.req, ctx.express.res)
    })


    it('routes/api/get::cover::exception handler', async() => {
        const ctx = require(_$t+'context')

        // trigger error
        let calls = 0
        ctx.express.res.json=()=>{ 
            // throw ex on first call only
            if (calls == 0){
                calls ++
                throw 'force error' 
            }
        }
    
        const route = ctx.express.captureRoutes(_$+'routes/api')

        await route(ctx.express.req, ctx.express.res)
    })
})