describe('tests/docker.containerIsUp/validateconfig', async()=>{

    it('tests/docker.containerIsUp/validateconfig::unhappy host not defined', async() => {
        const test = require(_$+'tests/docker.containerIsUp'),
            ctx = require(_$t+'context'),
            exception = await ctx.assert.throws(async() => await test.validateConfig({  }))

        ctx.assert.equal(exception.text, '.host required')
    })

    it('tests/docker.containerIsUp/validateconfig::unhappy container name not defined', async() => {
        const test = require(_$+'tests/docker.containerIsUp'),
            ctx = require(_$t+'context')

        await ctx.assert.throws(async() => await test.validateConfig({ host: 'test' }))
    })

})