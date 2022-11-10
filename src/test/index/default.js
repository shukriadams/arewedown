describe('index/default', async()=>{

    it('index/default::cover::starts server', async()=>{
        let ctx = require(_$t+'context'),
            started = false

        ctx.inject.object('./lib/server', {
            start(){
                started = true
            }
        })
        
        // index requiring will automatically invoke server start
        require(_$+'index')

        ctx.assert.true(started)
    })
    
})