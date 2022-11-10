describe('/lib/daemon/sendQueuedAlerts', async()=>{
    
    it('/lib/daemon/sendQueuedAlerts::cover::calls transports with queued alerts', async() => {
        const ctx = require(_$t+'context')

        // mock 
        ctx.inject.object('madscience-fsUtils', { 
            
            // return a base64 encoded strings to be our recipient name
            getChildDirs: ()=> [ 
                Buffer.from('name1').toString('base64')
            ]

        }) 

        // force a transport name
        ctx.settings({
            recipients: {
                abc : {
                    testTransport : 'mytransportsetting'
                }
            },
            transports: {
                testTransport : { }
            }
        })        

        // fake transport handlers
        const transportHandlers = {
            testTransport : { send(){ } }
        }

        ctx.inject.object('./transports', {
            getTransportHandlers:()=>transportHandlers
        })

        ctx.inject.object('fs-extra', {

            // ensure that hash of last alert message exists
            exists:()=> true,

            // read hash of last alert message sent, must be different hash
            readFile:()=> "not-the-has-of-last-message",

            // do nothing when write latest message hash
            outputFile:()=> {}
        })

        const daemon = ctx.clone(require(_$+'lib/daemon'))
        daemon.getAndClearDeltaForRecipient = ()=>{ 
            // fake delta
            return  {
                receiverName: 'abc'
            }
        }

        daemon.generateContent = ()=>{ return 'text' } 

        await daemon.sendQueuedAlerts()
    })

    
    it('/lib/daemon/sendQueuedAlerts::cover::no alerts', async() => {
        const ctx = require(_$t+'context')

        // mock 
        ctx.inject.object('madscience-fsUtils', { 
            
            // return a base64 encoded strings to be our recipient name
            getChildDirs: ()=> [ 
                Buffer.from('name1').toString('base64')
            ],

            // return no alerts
            readFilesInDir:()=> []
        })
        
        const daemon = ctx.clone(require(_$+'lib/daemon'))
        await daemon.sendQueuedAlerts() 
    })


    it('/lib/daemon/sendQueuedAlerts::cover::message already sent', async() => {
        const ctx = require(_$t+'context'),
            crypto = require('crypto'),
            messageHAsh = crypto.createHash('md5').update('mymessage').digest('hex')

        // mock 
        ctx.inject.object('madscience-fsUtils', { 
            
            // return a base64 encoded strings to be our recipient name
            getChildDirs: ()=> [ 
                Buffer.from('name1').toString('base64')
            ]

        }) 

        // force a transport name
        ctx.settings({
            recipients: {
                abc : {
                    testTransport : 'mytransportsetting'
                }
            },
            transports: {
                testTransport : { }
            }
        })        

        ctx.inject.object('fs-extra', {

            // ensure that hash of last alert message exists
            exists:()=> true,

            // get hash of message already sent
            readFile:()=> crypto.createHash('md5').update('mymessage').digest('hex')

        })

        const daemon = ctx.clone(require(_$+'lib/daemon'))
        daemon.getAndClearDeltaForRecipient = ()=>{ 
            // fake delta
            return  {
                receiverName: 'abc'
            }
        }

        // generate same hash as for message already sent
        daemon.generateContent = ()=>{ return 'mymessage' } 

        await daemon.sendQueuedAlerts()
    })

})