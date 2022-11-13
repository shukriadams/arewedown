describe('tests/general.dateInFile/validateConfig', async()=>{

    it('tests/general.dateInFile/validateConfig::unhappy no host', async() => {
        const ctx = require(_$t+'context'),
            test = require(_$+'tests/general.dateInFile')
            
        await ctx.assert.throws(async() => await test.validateConfig({ }) )
    })

    it('tests/general.dateInFile/validateConfig::unhappy no user', async() => {
        const ctx = require(_$t+'context'),
            test = require(_$+'tests/general.dateInFile')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host : 'myhost' }) )
    })

    it('tests/general.dateInFile/validateConfig::unhappy no password', async() => {
        const ctx = require(_$t+'context'),
            test = require(_$+'tests/general.dateInFile')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host : 'myhost', user : 'myuser'  }) )
    })

    it('tests/general.dateInFile/validateConfig::unhappy no path', async() => {
        const ctx = require(_$t+'context'),
            test = require(_$+'tests/general.dateInFile')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host : 'myhost', user : 'myuser', password : 'mypass'  }) )
    })

    it('tests/general.dateInFile/validateConfig::unhappy no range', async() => {
        const ctx = require(_$t+'context'),
            test = require(_$+'tests/general.dateInFile')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host : 'myhost', user : 'myuser', password : 'mypass', path : 'mypath'  }) )
    })

    it('tests/general.dateInFile/validateConfig::unhappy invalid range', async() => {
        const ctx = require(_$t+'context'),
            test = require(_$+'tests/general.dateInFile')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host : 'myhost', user : 'myuser', password : 'mypass', path : 'mypath', range: 'an invalid range'  }) )
    })

})