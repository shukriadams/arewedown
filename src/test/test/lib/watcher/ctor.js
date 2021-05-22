describe('lib/watcher/ctor', async()=>{
    
    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.inject.overwriteObject('./settings', { 
            recipients : { testuser : {} }
        })
        ctx.inject.object('./logger', { 
            instanceWatcher(){ return { error(){} } }
        })
        return ctx
    }

    it('lib/watcher/ctor::happy::instantiates watcher', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher')

        new Watcher({
            recipients : 'testuser'
        })
    })

    it('lib/watcher/ctor::unhappy::cover no recipients in watcher', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher')
        new Watcher()
    })

    it('lib/watcher/ctor::unhappy::cover undefined recipient', async()=>{
        const ctx = createTestStructures()
        ctx.inject.overwriteObject('./settings', { 
            recipients : { }
        })
        const Watcher = require(_$+'lib/watcher')
        new Watcher({
            recipients : 'testuser,'
        })
    })
})