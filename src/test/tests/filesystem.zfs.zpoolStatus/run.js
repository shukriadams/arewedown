describe('tests/filesystem.zfs.zpoolStatus/run', async()=>{
    
    it('tests/filesystem.zfs.zpoolStatus/run::happy pool online', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.out('...state: ONLINE...')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/filesystem.zfs.zpoolStatus')
        await test.run({ }) 
    })

    it('tests/filesystem.zfs.zpoolStatus/run::unhappy pool not online', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.out('...something else...')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/filesystem.zfs.zpoolStatus')
        await ctx.assert.throws(async() => await test.run({ }) )
    })

    it('tests/filesystem.zfs.zpoolStatus/run::unhappy stderr', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.err('...some err output...')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/filesystem.zfs.zpoolStatus')
        await ctx.assert.throws(async() => await test.run({ }) )
    })

    it('tests/filesystem.zfs.zpoolStatus/run::unhappy unexpected error', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                throw 'force err'
            }
        })

        const test = require(_$+'tests/filesystem.zfs.zpoolStatus')
        await ctx.assert.throws(async() => await test.run({ }) )
    })
})