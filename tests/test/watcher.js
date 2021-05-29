describe('tests/watcher', async()=>{

    it('tests/watcher/invald', async() => {
        const settings = require('./../settings'),
            urljoin = require('urljoin'),
            httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            status = await httputils.getStatus(urljoin(settings.url, 'watcher/invalid'))

        assert.equal(status, 404)
    })


})