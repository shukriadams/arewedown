describe('lib/watcher/tick', async()=>{
    
    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('cron', {
            CronJob : class { 
                nextDates(){ return ''}
            }
        })
        ctx.inject.object('./logger', { 
            instanceWatcher(){ return { info(){}, error(){} } }
        })            
        return ctx
    }

    it('lib/watcher/tick::happy::', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.doTest = ()=>{}
        watcher.tick()
    })

    it('lib/watcher/tick::unhappy::config has errors', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.doTest = ()=>{}
        watcher.config.__hasErrors = true
        watcher.tick()
    })    
    
    it('lib/watcher/tick::happy::isbusy', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.busy = true
        watcher.doTest = ()=>{}
        watcher.tick()
    })

    it('lib/watcher/tick::unhappy::exception', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.doTest = ()=>{ throw 'an error'}
        watcher.tick()
    })  
})