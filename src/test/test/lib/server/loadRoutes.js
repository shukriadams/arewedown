describe('server/loadRoutes', async()=>{
    
    it('server/loadRoutes::happy::should load routes without error', async() => {

        const server = require(_$+'lib/server'),
            fakeExpress = {
                post(){},
                get(){}
            }

        await server.loadRoutes(fakeExpress)
        // no assert, test is for cover
    })

})