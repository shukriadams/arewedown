describe('lib/timespan', async()=>{

    it('lib/timespan::happy:now', async()=>{
        const ctx = require(_$t+'context'),
            timespan = require(_$+'lib/timespan'),
            result = timespan('2001-01-01', '2001-01-01')

        ctx.assert.equal(result, 'now ...')
    })

    it('lib/timespan::happy:day diff single cover', async()=>{
        const ctx = require(_$t+'context'),
            timespan = require(_$+'lib/timespan'),
            result = timespan('2001-01-02', '2001-01-01')

        ctx.assert.includes(result, 'day')
        ctx.assert.excludes(result, 'days')
    })

    it('lib/timespan::happy:days diff plural cover', async()=>{
        const ctx = require(_$t+'context'),
            timespan = require(_$+'lib/timespan'),
            result = timespan('2001-01-03', '2001-01-01')

        ctx.assert.includes(result, 'days')
    })

    it('lib/timespan::happy:hours diff', async()=>{
        const ctx = require(_$t+'context'),
            timespan = require(_$+'lib/timespan'),
            result = timespan('2001-01-01 23:00:00', '2001-01-01 20:00:00')

        ctx.assert.includes(result, 'hours')
    })

    it('lib/timespan::happy:minutes diff', async()=>{
        const ctx = require(_$t+'context'),
            timespan = require(_$+'lib/timespan'),
            result = timespan('2001-01-01 20:02:00', '2001-01-01 20:00:00')

        ctx.assert.includes(result, 'minutes')
    })

    it('lib/timespan::happy:seconds diff', async()=>{
        const ctx = require(_$t+'context'),
            timespan = require(_$+'lib/timespan'),
            result = timespan('2001-01-01 20:00:05', '2001-01-01 20:00:00')

        ctx.assert.includes(result, 'seconds')
    })

})