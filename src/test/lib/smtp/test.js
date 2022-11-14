describe('lib/smtp/test', async()=>{

    it('lib/slack/test::cover::happy path', async()=>{
        const ctx = require(_$t+'context')
        ctx.settings({ transports : { smtp : { server : 'server', port : 'port', secure : true, user: 'user', pass : 'pass', from : 'from'  } } })

        const smtp = require(_$+'lib/smtp')

        // hide method
        smtp._send =()=>{}

        await smtp.test()
    })

})