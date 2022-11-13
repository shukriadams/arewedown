describe('tests/net.httpCheck/validateConfig', async()=>{

    it('tests/net.httpCheck/validateConfig::unhappy url not set', async() => {
        const test = require(_$+'tests/net.httpCheck'),
            ctx =  require(_$t+'context')

        await ctx.assert.throws(async() => await test.validateConfig({ }) )
    })

})