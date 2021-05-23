describe('lib/handlebar-helpers/ago', async()=>{
    
    it('lib/handlebar-helpers/ago::happy', async()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('s-ago', { 
            default(){ return 'it worked' },
        }) 

        const agoHelper = ctx.loadHandlebarsHelper(_$+'lib/handlebars-helpers/ago'),
            result = agoHelper('2000-01-01')

        ctx.assert.equal(result, 'it worked')
    })

    it('lib/handlebar-helpers/ago::happy::cover no date', async()=>{
        const ctx = require(_$t+'context'),
            agoHelper = ctx.loadHandlebarsHelper(_$+'lib/handlebars-helpers/ago'),
            result = agoHelper()

        ctx.assert.null(result)
    })
})