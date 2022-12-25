describe('lib/transports/enureSettingsValidOrExit', async()=>{


    it('lib/transports/enureSettingsValidOrExit::happy::should not test disabled test', async() => {

        const ctx = require(_$t+'context')

        ctx.settings({
            transports: {
                testTransport : {
                    enabled : false
                }
            }
        })

        const transports = require(_$+'lib/transports')
        await transports.enureSettingsValidOrExit()
        // no assert, coverage only
    })


    it('lib/transports/enureSettingsValidOrExit::unhappy::should not throw exception if transport does not have validateSettings method', async() => {
        const ctx = require(_$t+'context')

        ctx.settings({
            transports: {
                testTransport : {
                    enabled : true
                }
            }
        })

        ctx.inject.virtual('./testTransport', {
            // no validateSettings method here 
        })

        const transports = require(_$+'lib/transports'),
            exception = await ctx.assert.throws(async() => await transports.enureSettingsValidOrExit() )
            
        ctx.assert.includes(exception, 'missing expected method "validateSettings"')
    })

    
    it('lib/transports/enureSettingsValidOrExit::happy::validates transport', async() => {
        let ctx = require(_$t+'context'),
            validated = false

        ctx.settings({
            transports: {
                testTransport : {
                    enabled : true
                }
            }
        })

        ctx.inject.virtual('./testTransport', {
            validateSettings(){
                validated = true
            }
        })

        const transports = require(_$+'lib/transports')
        await transports.enureSettingsValidOrExit()
        ctx.assert.true(validated)
    })

})