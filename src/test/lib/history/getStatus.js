describe('lib/history/getStatus', async()=>{

    it('lib/history/getStatus::happy', async()=>{
        const ctx = require(_$t+'context')

        ctx.inject.object('fs-extra', {
            exists:()=> true,
            readJson:()=> 'done'
        })

        const history = ctx.clone(require(_$+'lib/history')),
            status = await history.getStatus('test')

        ctx.assert.equal(status, 'done')
    })

    it('lib/history/getStatus::unhappy::status doesnt exist', async()=>{
        const ctx = require(_$t+'context')

        ctx.inject.object('fs-extra', {
            exists:()=> false
        })

        const history = ctx.clone(require(_$+'lib/history')),
            status = await history.getStatus('test')

        ctx.assert.null(status)
    })

    it('lib/history/getStatus::unhappy::json read error', async()=>{
        const ctx = require(_$t+'context')

        ctx.inject.object('fs-extra', {
            exists:()=> true,
            readJson:()=>{ throw 'json err' }
        })

        const history = ctx.clone(require(_$+'lib/history')),
            status = await history.getStatus('test')

        ctx.assert.null(status)
    })
})