describe('tests/systemd.servicerunning', async()=>{
    const host = '127.0.0.1', 
        user = 'user', 
        password = 'password', 
        service = 'service'

    it('tests/systemd.servicerunning::unhappy no host', async() => {
        const ctx =  require(_$t+'context'),
            test = require(_$+'tests/systemd.servicerunning')
            
        await ctx.assert.throws(async() => await test({ }) )
    })

    it('tests/systemd.servicerunning::unhappy no user', async() => {
        const ctx =  require(_$t+'context'),
            test = require(_$+'tests/systemd.servicerunning')
            
        await ctx.assert.throws(async() => await test({ host }) )
    })

    it('tests/systemd.servicerunning::unhappy no password', async() => {
        const ctx =  require(_$t+'context'),
            test = require(_$+'tests/systemd.servicerunning')
            
        await ctx.assert.throws(async() => await test({ host, user }) )
    })

    it('tests/systemd.servicerunning::unhappy no service', async() => {
        const ctx =  require(_$t+'context'),
            test = require(_$+'tests/systemd.servicerunning')
            
        await ctx.assert.throws(async() => await test({ host, user, password }) )
    })

    it('tests/systemd.servicerunning::happy service running', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.out('running')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/systemd.servicerunning')
        await test({ host, user, password, service }) 
    })

    it('tests/systemd.servicerunning::unhappy service not running', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.out('not running')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/systemd.servicerunning'),
            exception = await ctx.assert.throws(async() => await test({ host, user, password, service }) )

        ctx.assert.includes(exception.text, 'not running')
    })
    
    it('tests/systemd.servicerunning::unhappy unhandled exception', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(){ throw 'error' }
        })

        const test = require(_$+'tests/systemd.servicerunning')
        await ctx.assert.throws(async() => await test({ host, user, password, service }) )
    })
})