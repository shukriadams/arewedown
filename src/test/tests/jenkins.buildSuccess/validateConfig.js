describe('tests/jenkins.buildSuccess/validateConfig', async()=>{

    it('tests/jenkins.buildSuccess/validateConfig::unhappy no host', async() => {
        const test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context')

        await ctx.assert.throws(async() => await test.validateConfig({ }) )
    })

    it('tests/jenkins.buildSuccess/validateConfig::unhappy no job', async() => {
        const test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context')

        await ctx.assert.throws(async() => await test.validateConfig({ url : 'test' }) )
    })
    
})