describe('tests/systemd.servicerunning/validateConfig', async()=>{
    const host = '127.0.0.1', 
        user = 'user', 
        password = 'password'

    it('tests/systemd.servicerunning/validateConfig::unhappy no host', async() => {
        const ctx =  require(_$t+'context'),
            test = require(_$+'tests/systemd.servicerunning')
            
        await ctx.assert.throws(async() => await test.validateConfig({ }) )
    })

    it('tests/systemd.servicerunning/validateConfig::unhappy no user', async() => {
        const ctx =  require(_$t+'context'),
            test = require(_$+'tests/systemd.servicerunning')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host }) )
    })

    it('tests/systemd.servicerunning/validateConfig::unhappy no password', async() => {
        const ctx =  require(_$t+'context'),
            test = require(_$+'tests/systemd.servicerunning')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host, user }) )
    })

    it('tests/systemd.servicerunning/validateConfig::unhappy no service', async() => {
        const ctx =  require(_$t+'context'),
            test = require(_$+'tests/systemd.servicerunning')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host, user, password }) )
    })

})