describe('tests', async()=>{

    it('tests/dashboard/default', async() => {
        const settings = require('./../settings'),
            urljoin = require('urljoin'),
            httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            response = await httputils.downloadString({ url : urljoin(settings.url, 'dashboard') })

        assert.equal(response.statusCode, 200)
    })

    it('tests/dashboard/', async() => {
        const settings = require('./../settings'),
            urljoin = require('urljoin'),
            httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            response = await httputils.downloadString({url : urljoin(settings.url, 'something-invalid')  })
            
        assert.equal(response.statusCode, 404)
    })

})