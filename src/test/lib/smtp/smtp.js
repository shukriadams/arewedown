describe('lib/smtp/smtp', async()=>{

    const createTestStructures =()=>{
        const ctx = require(_$t+'context')

        ctx.settings({ 
            transports : { 
                smtp : { 
                    server : 'server', 
                    port : 'port', 
                    secure : true, 
                    user: 'user', 
                    pass : 'pass', 
                    from : 'from'  
                } 
            } 
        })

        ctx.inject.class('./smtpClient', 
            class {
                send(){}
                test(){}
            }
        )

        return ctx
    }

    it('lib/smtp/smtp/send::happy coverage', async()=>{
        createTestStructures()
        const smtp = require(_$+'lib/smtp/smtp')
        await smtp.send('mail@example.com', { failing : [], passing: [] })
    })

    it('lib/smtp/smtp/validateSettings::cover', async()=>{
        createTestStructures()
        const smtp = require(_$+'lib/smtp/smtp')
        await smtp.validateSettings()
    })

    it('lib/smtp/smtp/validateSettings::unhappy::exception on settings check', async()=>{
        const ctx = createTestStructures()

        ctx.inject.class('./smtpClient', 
            class {
                test(){
                    throw 'forced exception'
                }
            }
        )

        const smtp = require(_$+'lib/smtp/smtp')

        await ctx.assert.throws(async() =>
            await smtp.validateSettings()
        )
    })

    it('lib/smtp/smtp/validateSettings::unhappy::exception on send', async()=>{
        createTestStructures()
        const smtp = require(_$+'lib/smtp/smtp')
        await smtp.send('mail@example.com', { failing : [], passing: [] })
    })
})