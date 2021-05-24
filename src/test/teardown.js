afterEach(done => {
    (async ()=>{

        const requireMock = require('./require')
        requireMock.clear()

        require(_$+'lib/settings').reset()
        require(_$+'lib/logger').reset()
        
        done()
    })()
})