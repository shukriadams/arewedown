describe('tests/net.httpCheck', async()=>{

    it('tests/net.httpCheck::unhappy url not set', async() => {
        const test = require(_$+'tests/net.httpCheck'),
            ctx =  require(_$t+'context')

        await ctx.assert.throws(async() => await test({ }) )
    })

    it('tests/net.httpCheck::unhappy host invalid', async() => {
        const test = require(_$+'tests/net.httpCheck'),
            ctx =  require(_$t+'context')

        await ctx.assert.throws(async() => await test({ host : 'invalid-string' }) )
    })

    it('tests/net.httpCheck::unhappy site not found', async() => {
        let ctx =  require(_$t+'context')

        ctx.inject.object('got', ()=>{
            throw { code : 'ENOTFOUND' }
        })
        const test = require(_$+'tests/net.httpCheck')
        
        await ctx.assert.throws(async() => await test({ host : 'http://example.com' }) )
    })

    it('tests/net.httpCheck::unhappy unknown lookup error', async() => {
        let ctx =  require(_$t+'context')

        ctx.inject.object('got', ()=>{
            throw { code : 'some-other-code', response : { statusCode : 500 } }
        })
        const test = require(_$+'tests/net.httpCheck')
        
        const exception = await ctx.assert.throws(async() => await test({ host : 'http://example.com' }) )
        ctx.assert.includes(exception.text, 'Expected HTTP code')
    })

    it('tests/net.httpCheck::happy', async() => {
        let ctx =  require(_$t+'context')
        ctx.inject.object('got', ()=>{
            return { statusCode : 200 }
        })

        const test = require(_$+'tests/net.httpCheck')
        await ctx.assert.throws(async() => await test({ host : 'http://example.com' }) )
    })
})