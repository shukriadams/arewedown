describe('lib/watcher/calculateNextRun', async()=>{
    
    it('lib/watcher/ctor::happy::calculateNextRun', async()=>{
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.cron = { nextDates(){ return ''} }
        watcher.calculateNextRun()
    })
})