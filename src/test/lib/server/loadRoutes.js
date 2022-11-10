describe('lib/server/loadRoutes', async()=>{
    
    it('lib/server/loadRoutes::happy::loads routes without error', async() => {

        const server = require(_$+'lib/server'),
            fakeExpress = {
                post(){},
                get(){}
            }

        await server.loadRoutes(fakeExpress)
        // no assert, test is for cover
    })

})