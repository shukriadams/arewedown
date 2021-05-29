describe('tests/content', async()=>{

    it('tests/content', async() => {
        const settings = require('./../settings'),
            httputils = require('madscience-httputils'),
            urljoin = require('urljoin'),
            assert = require('madscience-node-assert'),
            files  = [
                '/css/iframe.css',
                '/css/style.css',
                '/js/base.js',
                '/js/iframe.js'
            ]

            for (const file of files){
                status = await httputils.getStatus(urljoin(settings.url, 'content', file))
                assert.equal(status, 200)
            }

    })


})