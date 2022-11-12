describe('lib/smtp/test', async()=>{

    it('lib/slack/test::cover::happy path', async()=>{
        const smtp = require(_$+'lib/smtp')
        
        // hide method
        smtp._send =()=>{}

        await smtp.test()
    })

})