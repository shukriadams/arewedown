describe('array/split', async()=>{

    it('array/split::happy::shout split array', async() => {
        const arrayHelper = require(_$+'lib/array'),
            assert = require('madscience-node-assert'),
            result = arrayHelper.split('test ,, 123,', ',')

        assert.equal(result.length, 2)
        assert.equal(result[0], 'test')
        assert.equal(result[1], '123')
    })

})