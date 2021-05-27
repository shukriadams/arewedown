describe('tests/content', async()=>{

    it('tests/content', async() => {
        const httputils = require('madscience-httputils'),
            urljoin = require('urljoin'),
            assert = require('madscience-node-assert'),
            files  = [
                '/css/iframe.css',
                '/css/style.css',
                '/js/base.js',
                '/js/iframe.js'
            ]

            for (const file of files){
                status = await httputils.getStatus(urljoin('http://localhost:3000/content', file))
                assert.equal(status, 200)
            }

    })


})