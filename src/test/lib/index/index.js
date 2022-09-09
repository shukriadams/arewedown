describe('index', async()=>{

    it('index::unhappy::server starts but throws exception', async() => {
        const ctx = require(_$t+'context')
        ctx.inject.object('./lib/server', { 
            start(){ 
                throw 'forced test error' 
            } 
        })  

        // requiring autostarts server, coverage only
        require(_$+'index')
    })

})