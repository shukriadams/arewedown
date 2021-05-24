describe('lib/settings/searchAndReplaceTemplatedEnvVars', async()=>{

    it('lib/settings/searchAndReplaceTemplatedEnvVars::cover::handle arrays', async() => {
        const settings = require(_$+'lib/settings')
        settings.searchAndReplaceTemplatedEnvVars({ watchers : [{}, {}] })
    })
})