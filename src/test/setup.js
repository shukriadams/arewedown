beforeEach(done => {
    (async ()=>{
        // add global paths, makes importing tests much easier
        const path = require('path')
        global._$ = path.resolve(`${__dirname}/../`) + '/'
        global._$t = path.resolve(`${__dirname}/`) + '/'

        const requireMock = require('./require')
        requireMock.clear()

        done()
    })()
})