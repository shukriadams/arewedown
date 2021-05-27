describe('lib/settings/failIfNotSet', async()=>{

    it('lib/settings/failIfNotSet::cover::expect failure on null', async() => {
        const settings = require(_$+'lib/settings'),
            ctx = require(_$t+'context')

        await ctx.assert.throws(async() => await settings.failIfNotSet(null) )    
    })

    it('lib/settings/failIfNotSet::cover::expect failure on undefined', async() => {
        const settings = require(_$+'lib/settings'),
            ctx = require(_$t+'context')

        await ctx.assert.throws(async() => await settings.failIfNotSet() )    
    })
})