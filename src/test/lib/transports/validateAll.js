describe('lib/transports/validateAll', async()=>{


    it('lib/transports/validateAll::happy::should not test disabled test', async() => {

        const ctx = require(_$t+'context')

        ctx.settings({
            transports: {
                testTransport : {
                    enabled : false
                }
            }
        })

        const transports = require(_$+'lib/transports')
        await transports.validateAll()
        // no assert, coverage only
    })


    it('lib/transports/validateAll::unhappy::should not throw exception if transport does not have ensureSettingsOrExit method', async() => {
        const assert = require('madscience-node-assert'),
            ctx = require(_$t+'context')

        ctx.settings({
            transports: {
                testTransport : {
                    enabled : true
                }
            }
        })

        ctx.inject.virtual('./testTransport', {
            // no ensureSettingsOrExit method here 
        })

        const transports = require(_$+'lib/transports'),
            exception = await ctx.assert.throws(async() => await transports.validateAll() )
            
        assert.includes(exception, 'missing expected method "ensureSettingsOrExit"')
    })

    
    it('lib/transports/validateAll::happy::validates transport', async() => {
        let assert = require('madscience-node-assert'),
            ctx = require(_$t+'context'),
            validated = false

        ctx.settings({
            transports: {
                testTransport : {
                    enabled : true
                }
            }
        })

        ctx.inject.virtual('./testTransport', {
            ensureSettingsOrExit(){
                validated = true
            }
        })

        const transports = require(_$+'lib/transports')
        await transports.validateAll()
        assert.true(validated)
    })

})