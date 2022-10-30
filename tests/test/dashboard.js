describe('tests', async()=>{

    it('tests/dashboard/default', async() => {
        const settings = require('./../settings'),
            urljoin = require('urljoin'),
            httputils = require('madscience-httputils'),
            assert = require('madscience-node-assert'),
            dashboardsQuery = await httputils.downloadJSON({ url : urljoin(settings.url, 'api/dashboards') })

        // dashboard should never be empty
        assert.gt(dashboardsQuery.dashboards.length, 0)

        // very each dashboard can be reached
        for (let dashboard of dashboardsQuery.dashboards){
            const response = await httputils.downloadString({ url : urljoin(settings.url, `dashboard/${dashboard}`) })
            assert.equal(response.statusCode, 200)
        }
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