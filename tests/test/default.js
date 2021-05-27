describe('tests', async()=>{

    it('tests/default', async() => {
        const httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            response = await httputils.downloadString({url : 'http://localhost:3000' })

        assert.equal(response.statusCode, 200)
    })


})