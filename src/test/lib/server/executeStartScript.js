describe('lib/server/executeStartScript', async()=>{
    

    it('lib/server/executeStartScript::happy::should not execute start script if start script is null', async() => {
        
        let ctx = require(_$t+'context')
            logged = null

        ctx.inject.object('./logger', {
            instance(){
                return {
                    info(content){
                        // should not be called for this test
                        logged = content
                    }
                }
            }
        })

        ctx.settings({ onstart : null })

        const server = require(_$+'lib/server')
        await server.executeStartScript()
        ctx.assert.null(logged)
    })

    
    it('lib/server/executeStartScript::happy::executes start script', async() => {
        
        let ctx = require(_$t+'context'),
            logged = null

        ctx.inject.object('./logger', {
            instance(){
                return {
                    info(content){
                        // should not be called for this test
                        logged = content
                    }
                }
            }
        })

        ctx.inject.object('madscience-node-exec', {
            sh(){ }
        })

        ctx.settings({ onstart : 'some script' })

        const server = require(_$+'lib/server')
        await server.executeStartScript()
        ctx.assert.includes(logged, 'onstart finished with result')
    })
    

    it('lib/server/executeStartScript::cover::trap and rethrow exception on script error', async() => {
        
        let ctx = require(_$t+'context')

        ctx.inject.object('./logger', {
            instance(){
                return {
                    info(content){
                        // should not be called for this test
                        logged = content
                    }
                }
            }
        })

        // suppress
        ctx.inject.object('madscience-node-exec', {
            sh(){ 
                throw 'expected error'
            }
        })

        ctx.settings({ onstart : 'some script', onstartIgnoreError : true })

        const server = require(_$+'lib/server')
        await server.executeStartScript()   
    })
    
    it('lib/server/executeStartScript::unhappy::trap and rethrow exception on script error', async() => {
        
        let ctx = require(_$t+'context')

        ctx.inject.object('./logger', {
            instance(){
                return {
                    info(content){
                        // should not be called for this test
                        logged = content
                    }
                }
            }
        })

        // suppress
        ctx.inject.object('madscience-node-exec', {
            sh(){ 
                throw 'expected error'
            }
        })

        ctx.settings({ onstart : 'some script' })

        const server = require(_$+'lib/server')
        const exception = await ctx.assert.throws(async() => await server.executeStartScript() )    
        ctx.assert.equal(exception.ex, 'expected error')
    })
})