describe('lib/smtp/test', async()=>{

    it('lib/smtp/test::cover::happy path', async()=>{
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

        // stub out send
        ctx.inject.class('./smtpClient', class {
            send(){}
        })

        const smtp = require(_$+'lib/smtp/smtp')
        await smtp.test()
    })

})