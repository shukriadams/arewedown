
describe('lib/transports/ensureQueue', async()=>{

    it('lib/transports/ensureQueue::happy', async() => {

        const ctx = require(_$t+'context')
        ctx.inject.object('fs-extra', {
                ensureDir(){}
            }
        )

        const transports = require(_$+'lib/transports')
        await transports.ensureQueue()
    })

    it('lib/transports/ensureQueue::cover::exception ', async() => {

        const ctx = require(_$t+'context')
        ctx.inject.object('fs-extra', {
                ensureDir(){
                    throw 'error'
                }
            }
        )

        const transports = require(_$+'lib/transports')
        await transports.ensureQueue()
    })
})