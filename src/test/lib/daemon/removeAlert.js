describe('lib/daemon/removeAlert', async()=>{
    
    it('lib/daemon/removeAlert::cover::covers happy', async()=>{
        const ctx = require(_$t+'context')

        ctx.inject.object('fs-extra', { 
            // do nothing
            remove:()=>{}
        }) 

        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.removeAlert()
    })

    it('lib/daemon/removeAlert::cover::covers unhappy', async()=>{
        const ctx = require(_$t+'context')

        ctx.inject.object('fs-extra', { 
            remove:()=>{
                throw 'error'
            }
        }) 

        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.removeAlert()
    })

})