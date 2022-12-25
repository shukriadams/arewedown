describe('lib/smtp', async()=>{

    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.settings({ transports : { smtp : { server : 'server', port : 'port', secure : true, user: 'user', pass : 'pass', from : 'from'  } } })
        ctx.inject.class('smtp-client', {
            SMTPClient : class {
                connect(){}
                greet(){}
                authPlain(){}
                mail(){}
                rcpt(){}
                data(){}
                quit(){}
            }
        })
        return ctx
    }

    it('lib/smtp/send::happy', async()=>{
        const ctx = createTestStructures(),
            smtp = ctx.clone(require(_$+'lib/smtp'))

        // no result to test, coverage only
        await smtp.send('mail@example.com', { failing : [], passing: [] })
    })

    it('lib/smtp/validateSettings::cover', async()=>{
        const ctx = createTestStructures(),
            smtp = ctx.clone(require(_$+'lib/smtp'))
            
        await smtp.validateSettings()
    })

    it('lib/smtp/validateSettings::unhappy::throw exception on settings check', async()=>{
        const ctx = createTestStructures(),
            smtp = ctx.clone(require(_$+'lib/smtp'))
            
        ctx.inject.class('smtp-client', {
            SMTPClient : class {
                connect(){ throw 'error'}
            }
        })

        await ctx.assert.throws(async() => await smtp.validateSettings() )
    })

    it('lib/smtp/validateSettings::unhappy::throw exception on send', async()=>{
        const ctx = createTestStructures(),
            smtp = ctx.clone(require(_$+'lib/smtp'))

        ctx.inject.class('smtp-client', {
            SMTPClient : class {
                connect(){ throw 'error'}
            }
        })

        await smtp.send('mail@example.com', { failing : [], passing: [] })
    })
})