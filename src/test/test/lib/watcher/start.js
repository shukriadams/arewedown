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
        return ctx
    }

    it('lib/watcher/start::happy::', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.start()
    })
})