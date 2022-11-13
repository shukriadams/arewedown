describe('tests/filesystem.zfs.zpoolStatus/validateconfig', async()=>{

    it('tests/filesystem.zfs.zpoolStatus/validateconfig::unhappy host not defined', async() => {
        const test = require(_$+'tests/filesystem.zfs.zpoolStatus'),
            ctx = require(_$t+'context'),
            exception = await ctx.assert.throws(async() => await test.validateConfig({  }))

        ctx.assert.equal(exception.text, '.host required')
    })

    it('tests/filesystem.zfs.zpoolStatus/validateconfig::unhappy user not defined', async() => {
        const test = require(_$+'tests/filesystem.zfs.zpoolStatus'),
            ctx = require(_$t+'context')

        await ctx.assert.throws(async() => await test.validateConfig({ host: 'test' }))
    })

    it('tests/filesystem.zfs.zpoolStatus/validateconfig::unhappy password not defined', async() => {
        const test = require(_$+'tests/filesystem.zfs.zpoolStatus'),
            ctx = require(_$t+'context')

        await ctx.assert.throws(async() => await test.validateConfig({ host: 'test', user : 'myuser' }))
    })

    it('tests/filesystem.zfs.zpoolStatus/validateconfig::unhappy pool not defined', async() => {
        const test = require(_$+'tests/filesystem.zfs.zpoolStatus'),
            ctx = require(_$t+'context')

        await ctx.assert.throws(async() => await test.validateConfig({ host: 'test', user : 'myuser', password: 'mypass' }))
    })
})