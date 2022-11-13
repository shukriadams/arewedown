describe('tests/net.portOpen/validateConfig', async()=>{

    it('tests/net.portOpen/validateConfig::unhappy no host', async() => {
        const test = require(_$+'tests/net.portOpen'),
            ctx =  require(_$t+'context')
            
        await ctx.assert.throws(async() => await test.validateConfig({ }) )
    })

    it('tests/net.portOpen/validateConfig::unhappy no port', async() => {
        const test = require(_$+'tests/net.portOpen'),
            ctx =  require(_$t+'context')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host: '127.0.0.1' }) )
    })

})