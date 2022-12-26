describe('daemon/generateContent', async()=>{

    it('daemon/generateContent::happy::typical string from delta', async() => {
        const ctx = require(_$t+'context'),
            daemon = ctx.clone(require(_$+'lib/daemon')),
            message = daemon.generateContent({ 
                actualPassingCount : 3,
                actualFailingCount: 4, 
                failingDelta : ['first', 'second'], 
                passingDelta : ['third', 'fourth'],
                failingOther : ['fifth']
            })
            
        // string should contain the names of all recently passing and failing tests, and the fail count, but not the pass count
        ctx.assert.includes(message, 'first')
        ctx.assert.includes(message, 'second')
        ctx.assert.includes(message, 'third')
        ctx.assert.includes(message, 'fourth')
        ctx.assert.excludes(message, '3')
        ctx.assert.includes(message, '4')
    })

    it('daemon/generateContent::happy::no watcher text if no counts', async() => {
        const ctx = require(_$t+'context'),
             daemon = ctx.clone(require(_$+'lib/daemon')),
             message = daemon.generateContent({ 
                failingDelta : [], 
                passingDelta : [],
                failingOther : [],
                actualPassingCount : 0,
                actualFailingCount: 0, 
             })
             
         ctx.assert.includes(message, 'No watchers running')
     })

     it('daemon/generateContent::happy::all passing', async() => {
        const ctx = require(_$t+'context'),
             daemon = ctx.clone(require(_$+'lib/daemon')),
             message = daemon.generateContent({ 
                failingDelta : [], 
                passingDelta : [],
                failingOther : [],
                actualPassingCount : 3,
                actualFailingCount: 0, 
             })
             
         ctx.assert.includes(message, 'SUCCESS')
     })

     it('daemon/generateContent::happy::some previous fails, no delta', async() => {
        const ctx = require(_$t+'context'),
             daemon = ctx.clone(require(_$+'lib/daemon')),
             message = daemon.generateContent({ 
                failingDelta : [], 
                passingDelta : [],
                failingOther : [''],
                actualPassingCount : 3,
                actualFailingCount: 1, 
             })
             
         ctx.assert.includes(message, 'WARNING')
         ctx.assert.includes(message, '1')
     })

     it('daemon/generateContent::happy::array', async() => {
        const ctx = require(_$t+'context'),
            daemon = require(_$+'lib/daemon')

        ctx.assert.equal(daemon.plural(['1']), 'is')
     })

     it('daemon/generateContent::happy::some failing passing', async() => {
        const ctx = require(_$t+'context'),
             daemon = ctx.clone(require(_$+'lib/daemon')),
             message = daemon.generateContent({ 
                failingDelta : [], 
                passingDelta : [],
                failingOther : [],
                actualPassingCount : 3,
                actualFailingCount: 1, 
             })
             
         ctx.assert.includes(message, 'WARNING')
         ctx.assert.includes(message, '1')
     })

})