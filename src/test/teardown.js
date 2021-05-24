afterEach(done => {
    (async ()=>{

        const requireMock = require('./require')
        requireMock.clear()

        require(_$+'lib/settings').revert()
        
        done()
    })()
})