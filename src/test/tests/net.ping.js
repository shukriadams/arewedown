describe('tests/net.ping', async()=>{

    it('tests/net.ping::unhappy no host', async() => {
        const test = require(_$+'tests/net.ping'),
            ctx =  require(_$t+'context')
            
        await ctx.assert.throws(async() => await test.validateConfig({ }) )
    })

    it('tests/net.ping::happy', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('ping', { promise : { probe(){ return { alive : true } } } })
        const test = require(_$+'tests/net.ping')
            
        await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1' }) )
    })

    it('tests/net.ping::unhappy ping failed', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('ping', { promise : { probe(){ return { alive : false, output : '\n\ntest\ntest'  } } } })
        const test = require(_$+'tests/net.ping')
            
        const exception = await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1' }) )
        ctx.assert.equal(exception.type, 'awdtest.fail')
    })
})