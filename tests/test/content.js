describe('tests/content', async()=>{

    it('tests/content', async() => {
        const settings = require('./../settings'),
            httputils = require('madscience-httputils'),
            urljoin = require('urljoin'),
            assert = require('madscience-node-assert'),
            files  = [
                '/css/style.css',
                '/js/base.js'
            ]

            for (const file of files){
                let status = await httputils.getStatus(urljoin(settings.url, 'content', file))
                assert.equal(status, 200, `Failed to load ${file}`)
            }

    })


})