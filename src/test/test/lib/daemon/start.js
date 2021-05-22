describe('daemon/start', async()=>{

    const setupTestConditions = ()=> {
        const ctx = require(_$t+'context')
        
        ctx.inject.overwriteObject('./settings', { watchers: {
            test : { enabled : true }
        }})
        
        ctx.inject.addClass('./watcher', class{
            start(){ }
        })
        
        ctx.inject.object('cron', {
            CronJob : class { }
        })
        return ctx
    }

    it('daemon/start::happy::start daemon', async() => {
       const ctx = setupTestConditions()

       const  daemon =  ctx.clone(require(_$+'lib/daemon'))
       daemon.start()
    })

    it('daemon/start::cover::watched disabled', async() => {
        const ctx = setupTestConditions()

        ctx.inject.overwriteObject('./settings', { watchers: {
            test : { enabled : false }
        }})
        const daemon =  ctx.clone(require(_$+'lib/daemon'))
        daemon.start()
    })


})