describe('tests/systemd.servicerunning/run', async()=>{
    const host = '127.0.0.1', 
        user = 'user', 
        password = 'password', 
        service = 'service'

    it('tests/systemd.servicerunning/run::happy service running', async() => {
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
        await test.run({ host, user, password, service }) 
    })

    it('tests/systemd.servicerunning/run::unhappy service not running', async() => {
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
            exception = await ctx.assert.throws(async() => await test.run({ host, user, password, service }) )

        ctx.assert.includes(exception.text, 'not running')
    })
    
    it('tests/systemd.servicerunning/run::cover::stderr', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.err('some err')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/systemd.servicerunning')
        await ctx.assert.throws(async() => await test.run({ host, user, password, service }) )
    })

    it('tests/systemd.servicerunning/run::unhappy unhandled exception', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(){ throw 'error' }
        })

        const test = require(_$+'tests/systemd.servicerunning')
        await ctx.assert.throws(async() => await test.run({ host, user, password, service }) )
    })
})