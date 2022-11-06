describe('tests/net.portOpen', async()=>{

    it('tests/net.portOpen::unhappy no host', async() => {
        const test = require(_$+'tests/net.portOpen'),
            ctx =  require(_$t+'context')
            
        await ctx.assert.throws(async() => await test.validateConfig({ }) )
    })

    it('tests/net.portOpen::unhappy no port', async() => {
        const test = require(_$+'tests/net.portOpen'),
            ctx =  require(_$t+'context')
            
        await ctx.assert.throws(async() => await test.validateConfig({ host: '127.0.0.1' }) )
    })

    it('tests/net.portOpen::happy port open', async() => {
        let ctx =  require(_$t+'context')
        ctx.inject.class('netcat/client', class {
            addr(){ return { scan(port, cb){ cb( { 1234 : 'open'  } )} } }
        })

        const test = require(_$+'tests/net.portOpen')
        await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1', port: 1234 }) )
    })

    it('tests/net.portOpen::unhappy port closed', async() => {
        let ctx =  require(_$t+'context')
        ctx.inject.class('netcat/client', class {
            addr(){ return { scan(port, cb){ cb( { 1234 : 'close'  } )} } }
        })

        const test = require(_$+'tests/net.portOpen'),
            exception = await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1', port: 1234 }) )
        ctx.assert.includes(exception.text, 'closed')
    })

    it('tests/net.portOpen::unhappy exception', async() => {
        let ctx =  require(_$t+'context')
        ctx.inject.class('netcat/client', class {
            addr(){ throw 'error' }
        })
        
        const test = require(_$+'tests/net.portOpen')
        await ctx.assert.throws(async() => await test.run({ host: '127.0.0.1', port: 1234 }) )
    })
})