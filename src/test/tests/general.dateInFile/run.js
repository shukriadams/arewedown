describe('tests/general.dateInFile/run', async()=>{
    const createTestStructures=(filecontent = new Date())=>{
        const ctx = require(_$t+'context')
        
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.out(filecontent.toString())
                return {
                    start(){}
                }
            }
        })

        return ctx
    }

    it('tests/general.dateInFile/run::happy::pool online', async() => {
        createTestStructures()

        const test = require(_$+'tests/general.dateInFile')

        await test.run({ range : '9999D' }) 
    })

    it('tests/general.dateInFile/run::cover::second range', async() => {
        createTestStructures()

        const test = require(_$+'tests/general.dateInFile')

        await test.run({ range : '9999S' }) 
    })

    it('tests/general.dateInFile/run::cover::minute range', async() => {
        createTestStructures()

        const test = require(_$+'tests/general.dateInFile')
        
        await test.run({ range : '1m' }) 
    })

    it('tests/general.dateInFile/run::cover::hour range', async() => {
        createTestStructures()

        const test = require(_$+'tests/general.dateInFile')
        
        await test.run({ range : '666h' }) 
    })

    it('tests/general.dateInFile/run::unhappy::invalid date in file', async() => {
        const ctx = createTestStructures('not-a-valid-date')

        const test = require(_$+'tests/general.dateInFile')
        
        await ctx.assert.throws(async() => await test.run({ range : '666h' }))
    })

    it('tests/general.dateInFile/run::unhappy::date overrun', async() => {
        const timebelt = require('timebelt'),
            ctx = createTestStructures(timebelt.addDays(new Date, -1)) // 1 day ago

        const test = require(_$+'tests/general.dateInFile')
        
        await ctx.assert.throws(async() => await test.run({ range : '1s' })) // expires 1 sec ago
    })

    it('tests/general.dateInFile/run::unhappy::stderr', async() => {
        const ctx = require(_$t+'context')

        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                args.err('some err')
                return {
                    start(){}
                }
            }
        })

        const test = require(_$+'tests/general.dateInFile')
        
        await ctx.assert.throws(async() => await test.run({ range : '1s' })) 
    })

    it('tests/general.dateInFile/run::unhappy::exception', async() => {
        const ctx = require(_$t+'context')
        
        ctx.inject.class('simple-ssh', class {
            exec(cmd, args){
                throw 'some err'
            }
        })

        const test = require(_$+'tests/general.dateInFile')
        
        await ctx.assert.throws(async() => await test.run({ range : '1s' })) 
    })

})