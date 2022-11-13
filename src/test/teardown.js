afterEach(done => {
    (async ()=>{

        const requireMock = require('./require')
        requireMock.clear()

        const context = require('./context')
        context.clear()
        
        require(_$+'lib/settings').reset()
        require(_$+'lib/logger').reset()

        done()
    })()
})