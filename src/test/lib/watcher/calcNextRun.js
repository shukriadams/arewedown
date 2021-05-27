describe('lib/watcher/calcNextRun', async()=>{
    
    it('lib/watcher/ctor::happy::calcNextRun', async()=>{
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.cron = { nextDates(){ return ''} }
        watcher.calcNextRun()
    })
})