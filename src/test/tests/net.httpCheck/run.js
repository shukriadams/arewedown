describe('tests/net.httpCheck/run', async()=>{


    it('tests/net.httpCheck/run::unhappy site not found', async() => {
        let ctx =  require(_$t+'context')

        ctx.inject.object('got', ()=>{
            throw { code : 'ENOTFOUND' }
        })

        const test = require(_$+'tests/net.httpCheck')
        
        await ctx.assert.throws(async() => await test.run({ host : 'http://example.com' }) )
    })

    it('tests/net.httpCheck/run::unhappy unknown lookup error', async() => {
        let ctx =  require(_$t+'context')

        ctx.inject.object('got', ()=>{
            throw { code : 'some-other-code', response : { statusCode : 500 } }
        })

        const test = require(_$+'tests/net.httpCheck'),
            exception = await ctx.assert.throws(async() => await test.run({ host : 'http://example.com' }) )

        ctx.assert.includes(exception.text, 'Expected HTTP code')
    })

    it('tests/net.httpCheck/run::happy', async() => {
        let ctx =  require(_$t+'context')
        
        ctx.inject.object('got', ()=>{
            return { statusCode : 200 }
        })

        const test = require(_$+'tests/net.httpCheck')
        
        await ctx.assert.throws(async() => await test.run({ host : 'http://example.com' }) )
    })
})