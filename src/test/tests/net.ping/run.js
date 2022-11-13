describe('tests/net.ping/run', async()=>{

    it('tests/net.ping/run::happy', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('ping', { promise : { probe(){ return { alive : true } } } })
        const test = require(_$+'tests/net.ping')
            
        await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1' }) )
    })

    it('tests/net.ping/run::unhappy ping failed', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('ping', { promise : { probe(){ return { alive : false, output : '\n\ntest\ntest'  } } } })
        const test = require(_$+'tests/net.ping')
            
        const exception = await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1' }) )
        ctx.assert.equal(exception.type, 'awdtest.fail')
    })
})