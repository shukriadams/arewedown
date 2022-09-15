describe('index', async()=>{

    it('index::unhappy::server starts but throws exception', async() => {
        // disabled, new restart system is currently not testable :(
            
        /*
        const ctx = require(_$t+'context')
        ctx.inject.object('./lib/server', { 
            start(){ 
                throw 'forced test error' 
            } 
        })  

        // requiring autostarts server, coverage only
        require(_$+'index')
        console.log('server start succeeded')
        */
    })

})