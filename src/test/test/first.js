describe('basic', async()=>{
    it('should just work', async() => {
        
        const assert = require('madscience-node-assert'),
            proxyquire =  require('proxyquire'),
            CronProcess = proxyquire(_$+'lib/cronProcess', { './smtp': {
                test(){
                    return '123'
                }
            }}),
            cronProcess = new CronProcess({
                __name : 'test'
            })

        //assert.equal(cronProcess.test(), '123')
    })
})

