describe('daemon/internalWork', async()=>{

    const createTestStructures=()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('./settings', { logRetention: 1 })
        ctx.inject.object('timebelt', { daysDifference(){ return 2 } })
        ctx.inject.object('madscience-fsUtils', {
            readFilesUnderDir(){ return ['123'] }
        })
        ctx.inject.object('path', { 
            basename(){ return '123' } 
        })
        ctx.inject.object('fs-extra', { 
            stat(){ return { } },
            remove(){ }
        })        
        return ctx
    }

    it('daemon/internalWork::cover', async()=>{
        const ctx = createTestStructures()
        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.internalWork()
    })

    it('daemon/internalWork::cover::remove throws error', async()=>{
        const ctx = createTestStructures()
        ctx.inject.object('fs-extra', { 
            remove(){ throw 'expected error' }
        })
        
        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.internalWork()
    })

    it('daemon/internalWork::cover::stat throws error', async()=>{
        const ctx = createTestStructures()
        ctx.inject.object('fs-extra', { 
            stat(){ throw 'expected error' }
        })
        
        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.internalWork()
    })

    it('daemon/internalWork::cover::basename returns status.json', async()=>{
        const ctx = createTestStructures()
        ctx.inject.object('path', { 
            basename(){ return 'status.json' } 
        })
        
        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.internalWork()
    })

})