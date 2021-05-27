describe('lib/history/writePassing', async()=>{

    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('fs-extra', { 
            ensureDir(){ },
            exists(){ return true },
            remove(){ },
            readdir() { return [] },
            writeJson(){ }
        })  
        return ctx
    }

    it('lib/history/writePassing::happy', async()=>{
        const ctx = createTestStructures(),
            history = ctx.clone(require(_$+'lib/history')),
            status = await history.writePassing('test', new Date())

        ctx.assert.true(status.changed)
    })

    it('lib/history/writeFailing::happy', async()=>{
        const ctx = createTestStructures(),
            history = ctx.clone(require(_$+'lib/history'))

        ctx.inject.object('fs-extra', { 
            exists(){ return false }
        }) 

        const status = await history.writeFailing('test', new Date())
        ctx.assert.true(status.changed)
    })

})