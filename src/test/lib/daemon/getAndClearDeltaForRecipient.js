describe('lib/daemon/getAndClearDeltaForRecipient', async()=>{

    it('lib/daemon/getAndClearDeltaForRecipient::happy', async()=>{
        const ctx = require(_$t+'context')

        ctx.inject.object('madscience-fsUtils', { 
            
            // return a base64 encoded strings to be our recipient name
            getChildDirs:()=> [ 
                Buffer.from('name1').toString('base64')
            ],

            // return a two alerts, so we cover status up + down
            readFilesInDir:()=> ['alert1.json', 'alert2.json']
        }) 

        let calls = 0
        ctx.inject.object('fs-extra', {
            // fake alert content
            readJson:()=> { 
                // return status up first, then down, this lets us cover two pathways in one test
                calls ++
                return { status : calls === 1 ? 'up' : 'down' } 
            }
        })

        const daemon = ctx.clone(require(_$+'lib/daemon'))
        daemon.watchers = [
            { status: 'down', config: { name: 'fifth'} }
        ]

        await daemon.getAndClearDeltaForRecipient('somedir')
    })

    it('lib/daemon/getAndClearDeltaForRecipient::unhappy::json read exception', async()=>{
        const ctx = require(_$t+'context')

        ctx.inject.object('madscience-fsUtils', { 
            
            // return a base64 encoded strings to be our recipient name
            getChildDirs:()=> [ 
                Buffer.from('name1').toString('base64')
            ],

            // return a two alerts, so we cover status up + down
            readFilesInDir:()=> ['alert1.json', 'alert2.json']
        }) 

        ctx.inject.object('fs-extra', {
            // throw exception to hit exception handling line
            readJson:()=>{ 
                throw 'error'
            }
        })

        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.getAndClearDeltaForRecipient('somedir')
    })

})