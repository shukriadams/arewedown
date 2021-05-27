describe('index', async()=>{

    it('index::unhappy::server starts but throws exception', async() => {
        const ctx = require(_$t+'context')
        ctx.inject.object('./lib/server', { start(){ throw 'error' } })  
        require(_$+'index')
    })

})