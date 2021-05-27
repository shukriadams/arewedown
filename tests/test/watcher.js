describe('tests/watcher', async()=>{

    it('tests/watcher/invald', async() => {
        const httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            status = await httputils.getStatus('http://localhost:3000/watcher/invalid')

        assert.equal(status, 404)
    })


})