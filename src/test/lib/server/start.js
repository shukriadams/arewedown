describe('lib/server/start', async()=>{

    it('lib/server/start::cover::prints version', async() => {
        const ctx = require(_$t+'context')

        ctx.inject.object('./startArgs', {
            get(){
                return {
                    version : true,
                    testing : true
                }
            }
        })

        const server = require(_$+'lib/server')
        await server.start()
    })

    it('lib/server/start::happy::start the server', async() => {
        const ctx = require(_$t+'context')
        
        ctx.settings({ rootpath : '/some/path' })

        ctx.inject.object('./daemon', {
            start (){ }
        })

        ctx.inject.object('http', {
            createServer (){
                return {
                    listen(){}
                }
            }
        })
        
        const server = require(_$+'lib/server')
        // disable all server methods used in start
        server.executeStartScript = ()=>{}
        server.validateTransports = ()=>{}
        server.loadRoutes = ()=>{}
        await server.start()
        // no assert, cover only
    })

})