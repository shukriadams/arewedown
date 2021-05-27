describe('lib/server/executeStartScript', async()=>{
    

    it('lib/server/executeStartScript::happy::should not execute start script if start script is null ', async() => {
        
        let ctx = require(_$t+'context'),
            assert = require('madscience-node-assert'),
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
        assert.null(logged)
    })

    
    it('lib/server/executeStartScript::happy::should execute start script', async() => {
        
        let ctx = require(_$t+'context'),
            assert = require('madscience-node-assert'),
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
        assert.includes(logged, 'onstart finished with result')
    })

        
    it('lib/server/executeStartScript::unhappy::should trap exception on script error', async() => {
        
        let ctx = require(_$t+'context'),
            assert = require('madscience-node-assert')

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
        assert.equal(exception.ex, 'expected error')
    })
})