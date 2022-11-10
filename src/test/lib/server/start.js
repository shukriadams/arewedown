describe('lib/server/start', async()=>{

    it('lib/server/start::happy::return static version starting with --version, then exit', async() => {
        const assert = require('madscience-node-assert'),
            ctx = require(_$t+'context')

        ctx.inject.object('./startArgs', {
            get(){
                return {
                    version : true,
                    testing : true
                }
            }
        })

        const server = require(_$+'lib/server'),
            result =  await server.start()

        assert.equal(result, '0.0.1')
    })

    it('lib/server/start::happy::start the server', async() => {
        const ctx = require(_$t+'context')
        
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
        
        const server = ctx.clone(require(_$+'lib/server'))
        // disable all server methods used in start
        server.executeStartScript = ()=>{}
        server.validateTransports = ()=>{}
        server.loadRoutes = ()=>{}
        await server.start()
        // no assert, cover only
    })

})