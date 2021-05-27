describe('tests/status', async()=>{

    it('tests/status/default', async() => {
        const httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            status = await httputils.downloadJSON('http://localhost:3000/status')

        assert.null(status.error)
    })


})