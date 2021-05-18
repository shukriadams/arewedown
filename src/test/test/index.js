describe('index', async()=>{
    it('should return version', async() => {
        
        const assert = require('madscience-node-assert'),
            proxyquire =  require('proxyquire'),
            capcon = require('capture-console'),
            server = proxyquire(_$+'index', { './lib/startArgs': {
                get(){
                    return {
                        version : true,
                        testing : true
                    }
                }
            }})

        
        
        //await catpureconsole()
        //console.log(startServer)
       // console.log(`version`, version)

        //assert.equal(index(), '123')
    })
})

