describe('daemon/internalWork', async()=>{

    it('daemon/internalWork::happy', async()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('./settings', { logRetention: 1 })
        ctx.inject.object('timebelt', { daysDifference(){ return 2 } })
        ctx.inject.object('fs-extra', { 
            stat(){ return { } },
            remove(){ }
        })
        ctx.inject.object('path', { 
            basename(){ return '123' } 
        })
        ctx.inject.object('madscience-fsUtils', {
            readFilesUnderDir(){ return ['123'] }
        })
        
        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.internalWork()
        // no assert, cover only
    })

    it('daemon/internalWork::unhappy::remove throws error', async()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('./settings', { logRetention: 1 })
        ctx.inject.object('timebelt', { daysDifference(){ return 2 } })
        ctx.inject.object('fs-extra', { 
            stat(){ return { } },
            remove(){ throw 'expected error' }
        })
        ctx.inject.object('path', { 
            basename(){ return '123' } 
        })
        ctx.inject.object('madscience-fsUtils', {
            readFilesUnderDir(){ return ['123'] }
        })
        
        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.internalWork()
        // no assert, cover only
    })

    it('daemon/internalWork::unhappy::file is status.json', async()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('./settings', { logRetention: 1 })
        ctx.inject.object('timebelt', { daysDifference(){ return 2 } })
        ctx.inject.object('fs-extra', { 
            stat(){ return { } },
            remove(){ return '123' }
        })
        ctx.inject.object('path', { 
            basename(){ return 'status.json' } 
        })
        ctx.inject.object('madscience-fsUtils', {
            readFilesUnderDir(){ return ['123'] }
        })
        
        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.internalWork()
        // no assert, cover only
    })

})