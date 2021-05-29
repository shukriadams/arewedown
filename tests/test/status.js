describe('tests/status', async()=>{

    it('tests/status/default', async() => {
        const settings = require('./../settings'),
            urljoin = require('urljoin'),
            httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            status = await httputils.downloadJSON(urljoin(settings.url, 'status'))

        assert.null(status.error)
    })


})