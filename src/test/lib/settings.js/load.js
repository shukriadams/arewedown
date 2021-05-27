describe('lib/settings/load', async()=>{

    it('lib/settings/load::happy::load settings', async() => {
        const settings = require(_$+'lib/settings')
        settings.load()
    })

    it('lib/settings/load::cover::force delete of disable dashboard', async() => {
        const settings = require(_$+'lib/settings')
        settings.load({ dashboards : { test : { enabled : false } } })
    })

    it('lib/settings/load::cover::force delete of disable watcher', async() => {
        const settings = require(_$+'lib/settings')
        settings.load({ watchers : { test : { enabled : false } } })
    })
    
    it('lib/settings/load::cover::force delete of disable transport', async() => {
        const settings = require(_$+'lib/settings')
        settings.load({ transports : { test : { enabled : false } } })
    })

    it('lib/settings/load::unhappy::settings.yml load error', async() => {
        const ctx = require(_$t+'context'),
            settings = require(_$+'lib/settings')

        ctx.inject.object('fs-extra', { readFileSync(){ throw 'error' }})

        await ctx.assert.throws(async() => await settings.load() )    
    })
    
    it('lib/settings/load::unhappy::warn on settings.yml not found', async() => {
        const ctx = require(_$t+'context'),
            settings = require(_$+'lib/settings')

        ctx.inject.object('fs-extra', { existsSync(){ return false }})
        settings.load()
    })

    it('lib/settings/load::cover::parse watcher recipients if string-separated array', async() => {
        const settings = require(_$+'lib/settings')
        settings.load({ 
            recipients : { name1 : { enabled: true }, name2 : { enabled: true } },  
            watchers : { test : { enabled : true, recipients : 'name1, name2,' } } 
        })
    })

    
    it('lib/settings/load::cover::parse watcher recipients * and recipients exist', async() => {
        const ctx = require(_$t+'context'),
            settings = require(_$+'lib/settings')

        settings.load({ 
            recipients : { myrecipient : { enabled: true }}, 
            watchers : { test : { enabled : true, recipients : '*' } } 
        })
        const settingsValues = settings.get()

        ctx.assert.equal(settingsValues.watchers.test.recipients[0], 'myrecipient')
    })

    it('lib/settings/load::unhappy::watcher defines non-existent recipient', async() => {
        const ctx = require(_$t+'context'),
            settings = require(_$+'lib/settings')

        await ctx.assert.throws(async() => await settings.load({ 
            watchers : { test : { enabled : true, recipients : 'name' } } 
        }))    
    })

    it('lib/settings/load::unhappy::watcher defines non-existent test', async() => {
        const ctx = require(_$t+'context'),
            settings = require(_$+'lib/settings')

        ctx.inject.object('fs-extra', { existsSync(){ return false }})
        await ctx.assert.throws(async() => settings.load({ 
            watchers : { test : { enabled : true, test : 'invalid-test' } } 
        }))
    })
})