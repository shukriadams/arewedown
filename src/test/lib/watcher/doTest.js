describe('lib/watcher/doTest', async()=>{
    
    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        
        ctx.inject.object('cron', {
            CronJob : class { 
                nextDates(){ return ''}
            }
        })
        
        ctx.inject.object('./logger', { 
            instanceWatcher(){ return { info(){}, debug(){}, error(){} } }
        })
        
        ctx.inject.object('./history', { 
            writePassing(){ return { changed: true }},
            writeFailing(){ return { changed: true }},
        })
        
        ctx.inject.object('madscience-node-exec', { sh(){ return { code: 0 } } })
        
        // hide funcs that hit filesystem
        ctx.inject.object('fs-extra', {  
            ensureDir(){},
            writeJson(){}
        })

        ctx.inject.virtual('../tests/mytest', {
            // force pass
            run:()=>{}
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
        
        ctx.inject.object('./smtp', { 
            
        })

        return ctx
    }

    it('lib/watcher/doTest::happy::cover', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({ test : 'mytest', __safeName:'mytest', recipients : ['testuser'] })

        watcher.doTest()
    })

    it('lib/watcher/doTest::unhappy::throw config error', async()=>{
        const ctx = createTestStructures()
        ctx.inject.virtual('../tests/mytest', ()=>{ throw { type : 'configError'} })

        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({ test : 'mytest' })

        watcher.doTest()
    })

    it('lib/watcher/doTest::unhappy::throw awdtest.fail', async()=>{
        const ctx = createTestStructures()
        ctx.inject.virtual('../tests/mytest', { 
            // force pass
            run:()=>{
                throw { type : 'awdtest.fail'} 

            }
        })

        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({ test : 'mytest' })

        watcher.doTest()
    })

    it('lib/watcher/doTest::unhappy::throw awdtest.fail', async()=>{
        const ctx = createTestStructures()
        ctx.inject.virtual('../tests/mytest', ()=>{ throw 'some generic error' })

        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({ test : 'mytest' })

        watcher.doTest()
    })

    it('lib/watcher/doTest::happy::cmd test', async()=>{
        createTestStructures()
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({ cmd : 'mytest' })

        watcher.doTest()
    })
    
    it('lib/watcher/doTest::unhappy::cmd test error code', async()=>{
        const ctx = createTestStructures()
        ctx.inject.object('madscience-node-exec', { sh(){ return { code: 1 } } })
        
        const Watcher = require(_$+'lib/watcher'),
            watcher = new Watcher({ cmd : 'mytest' })

        watcher.doTest()
    })
})