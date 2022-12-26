describe('lib/watcher/queueAlerts', async()=>{
    
    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        
        ctx.inject.object('cron', {
            CronJob : class {  nextDates(){ return ''} }
        })
        
        ctx.inject.object('./logger', { 
            instanceWatcher(){ return { info(){}, debug(){}, error(){} }}
        })

        ctx.inject.object('fs-extra', {
            ensureDir(){},
            writeJson(){}
        })

        ctx.inject.object('./transports', {
            transportHandlers : {
                smtp : { }
            }
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

    it('lib/watcher/queueAlerts::happy', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({
                __safeId : 'foo',
                recipients : ['testuser']
            })

        await watcher.queueAlerts()
    })

    
    it('lib/watcher/queueAlerts::unhappy::no recipient with transport', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({
                recipients : ['testuser']
            })

        await watcher.queueAlerts()
    })

    it('lib/watcher/queueAlerts::happy::transport disabled', async()=>{
        const ctx = createTestStructures()
        ctx.settings({ 
            transports : { smtp : { enabled : false } }
        }) 

        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        await watcher.queueAlerts()
    })

    it('lib/watcher/queueAlerts::happy::undefined transport handler', async()=>{
        const ctx = createTestStructures()
        ctx.settings({ 
            transports : { bogusTransport : { enabled: true } }
        }) 

        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher()

        await watcher.queueAlerts()
    })

    it('lib/watcher/queueAlerts::happy::invalid recipient', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({
                recipients : ['bogususer']
            })

        await watcher.queueAlerts()
    })

    it('lib/watcher/queueAlerts::cover::not transport handler', async()=>{
        const ctx = createTestStructures()
        // remove smtp support from recipient
        ctx.settings({ 
            transports : {
                smtp : {
                    server : 'server', port : 'port', secure : true, user: 'user', pass : 'pass', from : 'from'
                }
            },
            recipients : {
                testuser : {

                 }
            }
        })    

        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({
                __safeId : 'foo',
                recipients : ['testuser']
            })

        await watcher.queueAlerts()
    })

})