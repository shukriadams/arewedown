describe('tests/docker.containerIsUp/run', async()=>{

    it('tests/docker.containerIsUp/run::happy', async() => {
        const ctx = require(_$t+'context')
        ctx.inject.object('madscience-httputils', {
            downloadString(){ return { statusCode: 200, body : JSON.stringify([ {Names : '/mycontainer', State : 'running'} ]) }}
        })

        const test = require(_$+'tests/docker.containerIsUp')
        await test.run({ host : 'test', container : 'mycontainer' })
    })

    it('tests/docker.containerIsUp/run::unhappy download fail', async() => {
        const test = require(_$+'tests/docker.containerIsUp'),
            ctx =  require(_$t+'context')

        ctx.inject.object('madscience-httputils', {
            downloadString(){ throw 'error' }
        })

        await ctx.assert.throws(async() => await test.run({ host: 'test', container : 'mycontainer' }))
    })

    it('tests/docker.containerIsUp/run::unhappy invalid status code', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('madscience-httputils', {
            downloadString(){ return { statusCode: 400 }}
        })

        const test = require(_$+'tests/docker.containerIsUp')
        await ctx.assert.throws(async() => await test.run({ host : 'test', container : 'mycontainer' }))
    })

    it('tests/docker.containerIsUp/run::unhappy container not running', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('madscience-httputils', {
            downloadString(){ return { statusCode: 200, body : JSON.stringify([ {Names : '/mycontainer', State : 'not-running'} ]) }}
        })

        const test = require(_$+'tests/docker.containerIsUp'),
            exception = await ctx.assert.throws(async() => await test.run({ host : 'test', container : 'mycontainer' }))

        ctx.assert.includes(exception.text, 'container state is')
    })

    it('tests/docker.containerIsUp/run::unhappy container not found', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('madscience-httputils', {
            downloadString(){ return { statusCode: 200, body : JSON.stringify([ {Names : '/someothercontainer', State : 'running'} ]) }}
        })
        
        const test = require(_$+'tests/docker.containerIsUp')
        await ctx.assert.throws(async() => await test.run({ host : 'test', container : 'mycontainer' }))
    })
})