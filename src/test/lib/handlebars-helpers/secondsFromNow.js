describe('lib/handlebar-helpers/secondsFromNow', async()=>{
    
    it('lib/handlebar-helpers/secondsFromNow::happy', async()=>{
        const ctx = require(_$t+'context')
        const secondsFromNow = ctx.loadHandlebarsHelper(_$+'lib/handlebars-helpers/secondsFromNow'),
            result = secondsFromNow(new Date((new Date().getTime() + 1000)).toString())

        ctx.assert.equal(result, 0)
    })

})