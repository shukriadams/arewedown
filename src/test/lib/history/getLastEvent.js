describe('lib/history/getLastEvent', async()=>{

    it('lib/history/getLastEvent::happy', async()=>{
        const ctx = require(_$t+'context'),
            history = ctx.clone(require(_$+'lib/history'))

        ctx.inject.object('fs-extra', { 
            exists: ()=> true,
            readJson: ()=> { return { name : 'myevent'} }
        }) 
        
        ctx.inject.object('madscience-fsUtils', { 
            readFilesInDir: ()=> ['status.json', 'item.json'] // return 2 events, 1 will always
        }) 

        const event = await history.getLastEvent('test')
        ctx.assert.equal(event.name, 'myevent')
    })



    it('lib/history/getLastEvent::unhappy history log dir doesnt exist', async()=>{
        const ctx = require(_$t+'context'),
            history = ctx.clone(require(_$+'lib/history'))

        ctx.inject.object('fs-extra', { 
            exists: ()=> false
        }) 
       
        const event = await history.getLastEvent('test')
        ctx.assert.null(event)
    })

    it('lib/history/getLastEvent::unhappy history file oesnt exist', async()=>{
        let ctx = require(_$t+'context'),
            history = ctx.clone(require(_$+'lib/history')),
            exists = false

        ctx.inject.object('fs-extra', { 
            exists: ()=>{
                // flip so returns true, then false
                exists = !exists
                return exists
            }
        }) 
       
        const event = await history.getLastEvent('test')
        ctx.assert.null(event)
    })

    it('lib/history/getLastEvent::unhappy no history', async()=>{
        const ctx = require(_$t+'context'),
            history = ctx.clone(require(_$+'lib/history'))

        ctx.inject.object('fs-extra', { 
            exists: ()=> true
        }) 
        
        ctx.inject.object('madscience-fsUtils', { 
            readFilesInDir: ()=> [] // return no events
        }) 

        const event = await history.getLastEvent('test')
        ctx.assert.null(event)
    })

    it('lib/history/getLastEvent::unhappy read json throws error', async()=>{
        const ctx = require(_$t+'context'),
            history = ctx.clone(require(_$+'lib/history'))

        ctx.inject.object('fs-extra', { 
            exists: ()=> true,
            readJson: ()=> { throw 'error' }
        }) 
        
        ctx.inject.object('madscience-fsUtils', { 
            readFilesInDir: ()=> ['item.json'] // return 1 event
        }) 

        const event = await history.getLastEvent('test')
        ctx.assert.null(event)
    })

})