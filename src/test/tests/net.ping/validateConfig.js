describe('tests/net.ping/validateConfig', async()=>{

    it('tests/net.ping/validateConfig::unhappy no host', async() => {
        const test = require(_$+'tests/net.ping'),
            ctx =  require(_$t+'context')
            
        await ctx.assert.throws(async() => await test.validateConfig({ }) )
    })

})