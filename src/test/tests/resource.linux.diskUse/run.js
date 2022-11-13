describe('tests/resource.linux.diskUse/run', async()=>{
    
    it('tests/resource.linux.diskUse/run::happy', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.out('some text\n... 4% ...')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/resource.linux.diskUse')
        await test.run({ threshold : 10 }) 
    })

    it('tests/resource.linux.diskUse/run::unhappy::disk overrun', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.out('some text\n... 11% ...')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/resource.linux.diskUse')
        await ctx.assert.throws(async() => await test.run({ threshold : 10 }) )
    })

    it('tests/resource.linux.diskUse/run::unhappy::invalid reading', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.out('garblebarble')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/resource.linux.diskUse')
        await ctx.assert.throws(async() => await test.run({ threshold : 10 }) )
    })

    it('tests/resource.linux.diskUse/run::unhappy::std err', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.err('some err')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/resource.linux.diskUse')
        await ctx.assert.throws(async() => await test.run({ threshold : 10 }) )
    })

    it('tests/resource.linux.diskUse/run::unhappy::exception', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                throw 'some err'
            }
        })

        const test = require(_$+'tests/resource.linux.diskUse')
        await ctx.assert.throws(async() => await test.run({ threshold : 10 }) )
    })
})