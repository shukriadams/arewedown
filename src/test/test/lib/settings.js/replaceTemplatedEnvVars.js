describe('lib/settings/replaceTemplatedEnvVars', async()=>{

    it('lib/settings/replaceTemplatedEnvVars::happy::applies env var', async() => {
        const ctx = require(_$t+'context'),
            settings = require(_$+'lib/settings')

        ctx.inject.object('process', { env : { MYVAR : 'myvalue' }})
        const result = settings.replaceTemplatedEnvVars('{{env.MYVAR}}')
        ctx.assert.equal(result, 'myvalue')
    })

    it('lib/settings/replaceTemplatedEnvVars::unhappy::throws error if env var not defined', async() => {
        const ctx = require(_$t+'context'),
            settings = require(_$+'lib/settings')

        ctx.inject.object('process', { env : { MYVAR : 'myvalue' }})
        const exception = await ctx.assert.throws(async() => settings.replaceTemplatedEnvVars('{{env.MYOTHERVAR}}'))
        ctx.assert.includes(exception, 'config expects environment variable')
    })
})