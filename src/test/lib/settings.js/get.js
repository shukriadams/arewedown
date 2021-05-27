describe('lib/settings/get', async()=>{

    it('lib/settings/get::cover::gets settings', async() => {
        const settings = require(_$+'lib/settings')
        settings.reset()
        settings.get()
    })

})