describe('routes/watcher/get', async()=>{

    const createTestStructures = () =>{
        const ctx = require(_$t+'context')
        ctx.settings({ log: 'test', watchers : { test : { } }})

        // need to return 3 history items to cover percent range - 2 items with identical date for zero range, and one with
        // outlying date for large range. mix status to cover most code lines
        let historyIndex = -1,
            history = [
                { date : new Date('2000-01-01'), status: 'down' }, 
                { date : new Date('2000-01-01'), status: 'up' }, 
                { date : new Date('2010-01-01'), status: 'down' }
            ]

        ctx.inject.object('fs-extra', 
            { 
                exists(){ return true }, 
                readJson(){  
                    historyIndex ++ 
                    return history[historyIndex]
                }
            }
        )
        
        // add 2 objects to history to satisfy collection handling
        ctx.inject.object('madscience-fsUtils', {  readFilesUnderDir(){ return [ {}, {} ] }})
        
        ctx.inject.object('path', { join(){ }})

        ctx.inject.object('timebelt', {
            minutesDifference : ()=> 2 // return that is above zero if math.log()
        })

        ctx.express.req.params.watcher = 'test'
        return ctx
    }

    it('routes/watcher/get::happy', async() => {
        const ctx = createTestStructures(),
            route = ctx.express.captureRoutes(_$+'routes/watcher')

        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/watcher/get::unhappy::json read error', async() => {
        const ctx = createTestStructures()
        ctx.inject.object('fs-extra', 
            {                 
                readJson(){ throw 'forced-error' }
            }
        )

        const route = ctx.express.captureRoutes(_$+'routes/watcher')

        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/watcher/get::unhappy::history not found', async() => {
        const ctx = createTestStructures()

        ctx.inject.object('fs-extra', {  exists(){ return false } })

        const route = ctx.express.captureRoutes(_$+'routes/watcher')

        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/watcher/get::unhappy::invalid watcher', async() => {
        const ctx =  require(_$t+'context')

        ctx.express.req.params.watcher = 'boguswatcher'

        const route = ctx.express.captureRoutes(_$+'routes/watcher')

        await route(ctx.express.req, ctx.express.res)
    })

    
    it('routes/watcher/get::cover::single history', async() => {
        const ctx = createTestStructures()

        ctx.inject.object('madscience-fsUtils', 
            {  readFilesUnderDir(){ return [ {} ] }}
        )

        const route = ctx.express.captureRoutes(_$+'routes/watcher')

        await route(ctx.express.req, ctx.express.res)
    })
})