describe('server', async()=>{
    it('starting with --version should return static version in package.json and exit', async() => {
        
        const assert = require('madscience-node-assert'),
            proxyquire =  require('proxyquire'),
            server = proxyquire(_$+'lib/server', { './startArgs': {
                get(){
                    return {
                        version : true,
                        testing : true
                    }
                }
            }})

        const result =  await server.start()
        assert.equal(result, '0.0.1')
    })
})

