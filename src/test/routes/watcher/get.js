describe('routes/watcher/get', async()=>{

    const createTestStructures =()=>{
        const ctx = require(_$t+'context')
        ctx.settings({ watchers : { test : {} }})

        // need to return 3 history items to cover percent range - 2 items with identical date for zero range, and one with
        // outlying date for large range
        let historyIndex = -1,
            history = [{ date : new Date('2000-01-01') }, { date : new Date('2000-01-01') }, { date : new Date('2010-01-01') }]

        ctx.inject.object('fs-extra', { exists(){ return true }, readJson(){  historyIndex++ ; return history[historyIndex] }})
        
        // add 2 objects to history to satisfy collection handling
        ctx.inject.object('madscience-fsUtils', {  readFilesUnderDirSync(){ return [ {}, {} ] }})
        ctx.inject.object('path', { join(){ }})
        ctx.express.req.params.watcher = 'test'
        return ctx
    }

    it('routes/watcher/get::happy', async() => {
        const ctx = createTestStructures(),
            route = ctx.express.getRoute(_$+'routes/watcher')

        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/watcher/get::history not found', async() => {
        const ctx = createTestStructures()
        ctx.inject.object('fs-extra', {  exists(){ return false } })
        const route = ctx.express.getRoute(_$+'routes/watcher')
        await route(ctx.express.req, ctx.express.res)
    })

    it('routes/watcher/get::invalid watcher', async() => {
        const ctx =  require(_$t+'context')
        ctx.express.req.params.watcher = 'boguswatcher'
        const route = ctx.express.getRoute(_$+'routes/watcher')
        await route(ctx.express.req, ctx.express.res)
    })
})