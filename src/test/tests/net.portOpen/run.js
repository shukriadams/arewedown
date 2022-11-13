describe('tests/net.portOpen/run', async()=>{


    it('tests/net.portOpen/run::happy port open', async() => {
        let ctx =  require(_$t+'context')
        ctx.inject.class('netcat/client', class {
            addr(){ return { scan(port, cb){ cb( { 1234 : 'open'  } )} } }
        })

        const test = require(_$+'tests/net.portOpen')
        await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1', port: 1234 }) )
    })

    it('tests/net.portOpen/run::unhappy port closed', async() => {
        let ctx =  require(_$t+'context')
        ctx.inject.class('netcat/client', class {
            addr(){ return { scan(port, cb){ cb( { 1234 : 'close'  } )} } }
        })

        const test = require(_$+'tests/net.portOpen'),
            exception = await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1', port: 1234 }) )
        ctx.assert.includes(exception.text, 'closed')
    })

    it('tests/net.portOpen/run::unhappy exception', async() => {
        let ctx =  require(_$t+'context')
        ctx.inject.class('netcat/client', class {
            addr(){ throw 'error' }
        })
        
        const test = require(_$+'tests/net.portOpen')
        await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1', port: 1234 }) )
    })
})