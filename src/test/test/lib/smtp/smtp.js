describe('lib/smtp', async()=>{

    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('./settings', { 
            transports : { smtp : {} }
        })
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
            smtp = ctx.clone(require(_$+'lib/smtp')),
            result = await smtp.send()

        ctx.assert.equal(result.result, 'mail sent.')
    })

    it('lib/smtp/ensureSettingsOrExit::cover', async()=>{
        const ctx = createTestStructures(),
            smtp = ctx.clone(require(_$+'lib/smtp'))
            
        await smtp.ensureSettingsOrExit()
    })
})