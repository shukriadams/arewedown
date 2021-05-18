describe('index', async()=>{
    it('should return version', async(done) => {
        
        const assert = require('madscience-node-assert'),
            proxyquire =  require('proxyquire'),
            capcon = require('capture-console'),
            startServer = proxyquire(_$+'index', { './lib/startArgs': {
                get(){
                    return {
                        version : true,
                        testing : true
                    }
                }
            }})


        const catpureconsole = new Promise((resolve, reject)=>{
            const version = capcon.captureStdout(async()=>{
                await startServer()
                console.log(`version`, version)
                done()
            })
        })


        console.log(`version`, version)

        //assert.equal(index(), '123')
    })
})

