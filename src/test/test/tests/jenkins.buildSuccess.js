describe('tests/jenkins.buildSuccess', async()=>{

    it('tests/jenkins.buildSuccess::unhappy no host', async() => {
        const test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context')
        await ctx.assert.throws(async() => await test({ }) )
    })

    it('tests/jenkins.buildSuccess::unhappy no job', async() => {
        const test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context')
        await ctx.assert.throws(async() => await test({ url : 'test' }) )
    })
    
    it('tests/jenkins.buildSuccess::unhappy server verify error', async() => {
        const test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context')

        ctx.inject.object('madscience-httputils', {
            downloadString(){ throw 'error' }
        })

        await ctx.assert.throws(async() => await test({ host : 'test', job : 'myjob' }))
    })

    it('tests/jenkins.buildSuccess::unhappy invalid status code on server verify', async() => {
        const test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context')

        ctx.inject.object('madscience-httputils', {
            downloadString(){ return { statusCode : 500 } }
        })

        await ctx.assert.throws(async() => await test({ host : 'test', job : 'myjob' }))
    })

    it('tests/jenkins.buildSuccess::unhappy download error on job lookup', async() => {
        let test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context'),
            calls = 0

        ctx.inject.object('madscience-httputils', {
            downloadString(){ if (calls == 0) { calls ++; return { statusCode: 200} } throw 'error'  }
        })

        await ctx.assert.throws(async() => await test({ host : 'test', job : 'myjob' }))
    })
    
    it('tests/jenkins.buildSuccess::unhappy job not found', async() => {
        let test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context'),
            calls = 0

        ctx.inject.object('madscience-httputils', {
            downloadString(){ if (calls == 0) { calls ++; return { statusCode: 200} } return { statusCode: 404}  }
        })

        await ctx.assert.throws(async() => await test({ host : 'test', job : 'myjob' }))
    })

    it('tests/jenkins.buildSuccess::unhappy job returned invalid json', async() => {
        let test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context'),
            calls = 0

        ctx.inject.object('madscience-httputils', {
            downloadString(){ if (calls == 0) { calls ++; return { statusCode: 200} } return { statusCode: 200, body : 'not-valid-json' }  }
        })

        await ctx.assert.throws(async() => await test({ host : 'test', job : 'myjob' }))
    })

    it('tests/jenkins.buildSuccess::unhappy job not passing', async() => {
        let test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context'),
            calls = 0

        ctx.inject.object('madscience-httputils', {
            downloadString(){ if (calls == 0) { calls ++; return { statusCode: 200} } return { statusCode: 200, body : '{ "result" : "aborted" }' }  }
        })

        const exception = await ctx.assert.throws(async() => await test({ host : 'test', job : 'myjob' }))
        ctx.assert.includes(exception.text, 'Jenkins job has unwanted status')
    })

    it('tests/jenkins.buildSuccess::happy job is passing', async() => {
        let test = require(_$+'tests/jenkins.buildSuccess'),
            ctx =  require(_$t+'context'),
            calls = 0

        ctx.inject.object('madscience-httputils', {
            downloadString(){ if (calls == 0) { calls ++; return { statusCode: 200} } return { statusCode: 200, body : '{ "result" : "Success" }' }  }
        })

        await test({ host : 'test', job : 'myjob' })
    })
})