describe('tests', async()=>{

    it('tests/default', async() => {
        const settings = require('./../settings'),
            httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            response = await httputils.downloadString({ url : settings.url })

        assert.equal(response.statusCode, 200)
    })


})