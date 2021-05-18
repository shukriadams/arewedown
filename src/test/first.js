describe('basic', async()=>{
    it('should just work', async() => {
        
        const assert = require('madscience-node-assert'),
            proxyquire =  require('proxyquire'),
            Watcher = proxyquire(_$+'lib/watcher', { './smtp': {
                test(){
                    return '123'
                }
            }}),
            watcher = new Watcher({
                __name : 'test'
            })

        //assert.equal(watcher.test(), '123')
    })
})

