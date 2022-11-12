describe('lib/watcher/start', async()=>{
    
    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('cron', {
            CronJob : class { 
                nextDates(){ return ''}
            }
        })

        ctx.inject.object('./logger', { 
            instanceWatcher(){ return { info(){} } }
        })

        ctx.inject.object('./history', {
            getStatus:()=>{ return {} }
        })

        ctx.inject.object('../tests/net.httpCheck', { 
            // force pass
            validateConfig(){ }
        })

        return ctx
    }

    it('lib/watcher/start::happy::', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.start()
    })

    it('lib/watcher/start::cover::unexpected error handler', async()=>{
        const ctx = createTestStructures()
        
        ctx.inject.object('../tests/net.httpCheck', { 
            validateConfig(){ throw 'forced error' }
        })
        
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.start()
    })
})