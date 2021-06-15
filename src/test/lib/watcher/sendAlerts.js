describe('lib/watcher/sendAlerts', async()=>{
    
    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.inject.object('cron', {
            CronJob : class {  nextDates(){ return ''} }
        })
        ctx.inject.object('./logger', { 
            instanceWatcher(){ return { info(){}, debug(){}, error(){} }}
        })
        ctx.settings({ 
            transports : {
                smtp : {
                    server : 'server', port : 'port', secure : true, user: 'user', pass : 'pass', from : 'from'
                }
            },
            recipients : {
                testuser : {
                    smtp: '1@2.3'
                 }
            }
        })        

        ctx.inject.object('./smtp', {  send(){ return {} } })
        return ctx
    }

    it('lib/watcher/sendAlerts::happy::', async()=>{
        const ctx = createTestStructures()
        ctx.settings({ 
            transports : {
                smtp : {
                    server : 'server', port : 'port', secure : true, user: 'user', pass : 'pass', from : 'from'
                }
            },            
            recipients : { testuser : { } }
        })   

        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({
                recipients : ['testuser']
            })

        watcher.sendAlerts()
    })

    
    it('lib/watcher/sendAlerts::unhappy::no recipient with transport', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({
                recipients : ['testuser']
            })

        watcher.sendAlerts()
    })

    it('lib/watcher/sendAlerts::happy::transport disabled', async()=>{
        const ctx = createTestStructures()
        ctx.settings({ 
            transports : { smtp : { enabled : false } }
        }) 

        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.sendAlerts()
    })

    it('lib/watcher/sendAlerts::happy::undefined transport handler', async()=>{
        const ctx = createTestStructures()
        ctx.settings({ 
            transports : { bogusTransport : { enabled: true } }
        }) 

        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        watcher.sendAlerts()
    })

    it('lib/watcher/sendAlerts::happy::invalid recipient', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({
                recipients : 'bogususer'
            })

        watcher.sendAlerts()
    })

})