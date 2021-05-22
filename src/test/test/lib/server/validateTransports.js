describe('lib/server/validateTransports', async()=>{


    it('lib/server/validateTransports::happy::should not test disabled test', async() => {

        const ctx = require(_$t+'context')

        ctx.inject.object('./settings', {
            transports: {
                testTransport : {
                    enabled : false
                }
            }
        })

        const server = require(_$+'lib/server')
        await server.validateTransports()
        // no assert, coverage only
    })


    it('lib/server/validateTransports::unhappy::should not throw exception if transport does not have ensureSettingsOrExit method', async() => {
        const assert = require('madscience-node-assert'),
            ctx = require(_$t+'context')

        ctx.inject.object('./settings', {
            transports: {
                testTransport : {
                    enabled : true
                }
            }
        })

        ctx.inject.virtual('./testTransport', {
            // no ensureSettingsOrExit method here 
        })

        const server = require(_$+'lib/server'),
            exception = await ctx.assert.throws(async() => await server.validateTransports() )
            
        assert.includes(exception, 'missing expected method "ensureSettingsOrExit"')
    })

    
    it('lib/server/validateTransports::happy::validates transport', async() => {
        let assert = require('madscience-node-assert'),
            ctx = require(_$t+'context'),
            validated = false

        ctx.inject.object('./settings', {
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

        const server = require(_$+'lib/server')
        await server.validateTransports()
        assert.true(validated)
    })

})