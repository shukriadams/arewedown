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

        const transports = require(_$+'lib/transports')
        // mock in a handler for testTransport
        transports.transportHandlers = {
            testTransport : {
                validateSettings(){
                    validated = true
                }
            }
        }
        
        await transports.enureSettingsValidOrExit()
        ctx.assert.true(validated)
    })

    it('lib/transports/enureSettingsValidOrExit::cover::exception', async() => {
        let ctx = require(_$t+'context')

        ctx.settings({
            transports: {
                testTransport : {
                    enabled : true
                }
            }
        })

        const transports = require(_$+'lib/transports')

        // mock in a handler for testTransport
        transports.transportHandlers = {
            testTransport : {
                validateSettings(){
                    throw 'error'
                }
            }
        }

        // prevent process exit
        transports._getProcess = ()=>{
            return {
                exit(){}
            }
        }
        
        await transports.enureSettingsValidOrExit()
    })

})