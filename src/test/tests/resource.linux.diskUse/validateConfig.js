describe('tests/resource.linux.diskUse/validateconfig', async()=>{

    it('tests/resource.linux.diskUse/validateconfig::unhappy host not defined', async() => {
        const test = require(_$+'tests/resource.linux.diskUse'),
            ctx = require(_$t+'context'),
            exception = await ctx.assert.throws(async() => await test.validateConfig({  }))

        ctx.assert.equal(exception.text, '.host required')
    })

    it('tests/resource.linux.diskUse/validateconfig::unhappy user not defined', async() => {
        const test = require(_$+'tests/resource.linux.diskUse'),
            ctx = require(_$t+'context'),
            exception = await ctx.assert.throws(async() => await test.validateConfig({ host: 'myhost' }))

        ctx.assert.equal(exception.text, '.user required')
    })

    it('tests/resource.linux.diskUse/validateconfig::unhappy password not defined', async() => {
        const test = require(_$+'tests/resource.linux.diskUse'),
            ctx = require(_$t+'context'),
            exception = await ctx.assert.throws(async() => await test.validateConfig({ host: 'myhost', user : 'myuser' }))

        ctx.assert.equal(exception.text, '.password required')
    })

    it('tests/resource.linux.diskUse/validateconfig::unhappy path not defined', async() => {
        const test = require(_$+'tests/resource.linux.diskUse'),
            ctx = require(_$t+'context'),
            exception = await ctx.assert.throws(async() => await test.validateConfig({ host: 'myhost', user : 'myuser', password: 'mypass' }))

        ctx.assert.equal(exception.text, '.path required')
    })

    it('tests/resource.linux.diskUse/validateconfig::unhappy threshold not defined', async() => {
        const test = require(_$+'tests/resource.linux.diskUse'),
            ctx = require(_$t+'context'),
            exception = await ctx.assert.throws(async() => await test.validateConfig({ host: 'myhost', user : 'myuser', password: 'mypass', path: 'mypath' }))

        ctx.assert.equal(exception.text, '.threshold required')
    })    

    it('tests/resource.linux.diskUse/validateconfig::unhappy threshold invalid', async() => {
        const test = require(_$+'tests/resource.linux.diskUse'),
            ctx = require(_$t+'context'),
            exception = await ctx.assert.throws(async() => await test.validateConfig({ host: 'myhost', user : 'myuser', password: 'mypass', path: 'mypath', threshold: 'not-an-int' }))

        ctx.assert.equal(exception.text, '.threshold must be and integer')
    })

    it('tests/resource.linux.diskUse/validateconfig::unhappy threshold range invalid', async() => {
        const test = require(_$+'tests/resource.linux.diskUse'),
            ctx = require(_$t+'context'),
            exception = await ctx.assert.throws(async() => await test.validateConfig({ host: 'myhost', user : 'myuser', password: 'mypass', path: 'mypath', threshold: 101 }))

        ctx.assert.equal(exception.text, '.threshold must be between 0 and 100')
    }) 
})