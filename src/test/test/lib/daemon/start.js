describe('daemon/start', async()=>{

    it('daemon/start::happy::start daemon', async() => {
        const ctx = require(_$t+'context')
        ctx.inject.object('./settings', { watchers: {
            test : { enabled : true }
        }})
        
        ctx.inject.addClass('./watcher', class{
            start(){ }
        })
        
        ctx.inject.object('cron', {
            CronJob : class { }
        })

        const  daemon =  ctx.clone(require(_$+'lib/daemon'))
        daemon.start()
    })

})