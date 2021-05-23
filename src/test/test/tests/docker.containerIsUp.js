describe('tests/docker.containerIsUp', async()=>{

    it('tests/docker.containerIsUp::happy', async() => {
        const ctx = require(_$t+'context')
        ctx.inject.object('madscience-httputils', {
            downloadString(){ return { statusCode: 200, body : JSON.stringify([ {Names : '/mycontainer', State : 'running'} ]) }}
        })
        const test = require(_$+'tests/docker.containerIsUp')
        await test({ host : 'test', container : 'mycontainer' })
    })

    it('tests/docker.containerIsUp::unhappy host not defined', async() => {
        const test = require(_$+'tests/docker.containerIsUp'),
            ctx = require(_$t+'context')
        await ctx.assert.throws(async() => await test({  }))
    })

    it('tests/docker.containerIsUp::unhappy container name not defined', async() => {
        const test = require(_$+'tests/docker.containerIsUp'),
            ctx = require(_$t+'context')
        await ctx.assert.throws(async() => await test({ host: 'test' }))
    })

    it('tests/docker.containerIsUp::unhappy download fail', async() => {
        const test = require(_$+'tests/docker.containerIsUp'),
            ctx =  require(_$t+'context')

        ctx.inject.object('madscience-httputils', {
            downloadString(){ throw 'error' }
        })

        await ctx.assert.throws(async() => await test({ host: 'test', container : 'mycontainer' }))
    })

    it('tests/docker.containerIsUp::unhappy invalid status code', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('madscience-httputils', {
            downloadString(){ return { statusCode: 400 }}
        })

        const test = require(_$+'tests/docker.containerIsUp')
        await ctx.assert.throws(async() => await test({ host : 'test', container : 'mycontainer' }))
    })

    it('tests/docker.containerIsUp::unhappy container not running', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('madscience-httputils', {
            downloadString(){ return { statusCode: 200, body : JSON.stringify([ {Names : '/mycontainer', State : 'not-running'} ]) }}
        })
        const test = require(_$+'tests/docker.containerIsUp')
        await ctx.assert.throws(async() => await test({ host : 'test', container : 'mycontainer' }))
    })

    it('tests/docker.containerIsUp::unhappy container not found', async() => {
        const ctx =  require(_$t+'context')
        ctx.inject.object('madscience-httputils', {
            downloadString(){ return { statusCode: 200, body : JSON.stringify([ {Names : '/someothercontainer', State : 'running'} ]) }}
        })
        const test = require(_$+'tests/docker.containerIsUp')
        await ctx.assert.throws(async() => await test({ host : 'test', container : 'mycontainer' }))
    })
})