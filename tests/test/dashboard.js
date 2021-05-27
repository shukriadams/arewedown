describe('tests', async()=>{

    it('tests/dashboard/default', async() => {
        const httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            response = await httputils.downloadString({url : 'http://localhost:3000/dashboard' })

        assert.equal(response.statusCode, 200)
    })

    it('tests/dashboard/', async() => {
        const httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            response = await httputils.downloadString({url : 'http://localhost:3000/dashboard/something-invalid' })
            
        assert.equal(response.statusCode, 404)
    })

})