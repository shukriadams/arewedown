describe('lib/handlebar-helpers/date', async()=>{
    
    it('lib/handlebar-helpers/ago::happy', async()=>{
        const ctx = require(_$t+'context')
        const agoHelper = ctx.loadHandlebarsHelper(_$+'views/helpers/date'),
            result = agoHelper('01-01-2001 11:11:11')

        ctx.assert.equal(result, '2001-01-01 11:11')
    })
})