/**
 * istanbul ignore next : no need to test dev structures
 */
module.exports = express => {
    
    let cycle = 0

    /* istanbul ignore next : no need to test dev structures */
    express.get('/dev/cycle', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            let settings = require('./../lib/settings').get(),
                fs = require('fs-extra')

            await fs.ensureDir('./dummyfiles')

            if (cycle > 4)
                cycle = 0

            if (cycle === 0){
                // all failing
                await fs.remove('./dummyfiles/dummyfile0')
                await fs.remove('./dummyfiles/dummyfile1')
                await fs.remove('./dummyfiles/dummyfile2')
                await fs.remove('./dummyfiles/dummyfile3')
                await fs.remove('./dummyfiles/dummyfile4')
                await fs.remove('./dummyfiles/dummyfile5')
                await fs.remove('./dummyfiles/dummyfile6')
                await fs.remove('./dummyfiles/dummyfile7')
                await fs.remove('./dummyfiles/dummyfile8')
                res.send('0 pass, 9 fail')
            }

            if (cycle === 1){
                // some passing
                await fs.writeFile('./dummyfiles/dummyfile0', '')
                await fs.writeFile('./dummyfiles/dummyfile1', '')
                await fs.writeFile('./dummyfiles/dummyfile2', '')
                await fs.writeFile('./dummyfiles/dummyfile3', '')
                res.send('4 pass, 5 fail')
            }

            if (cycle === 2){
                // more passing
                await fs.writeFile('./dummyfiles/dummyfile4', '')
                await fs.writeFile('./dummyfiles/dummyfile5', '')
                await fs.writeFile('./dummyfiles/dummyfile6', '')
                await fs.writeFile('./dummyfiles/dummyfile7', '')
                res.send('8 pass, 1 fail')
            }

            if (cycle === 3){
                // all passing
                await fs.writeFile('./dummyfiles/dummyfile8', '')
                res.send('9 pass, 0 fail')
            }

            if (cycle === 4){
                // 1 failing
                await fs.remove('./dummyfiles/dummyfile8')
                res.send('8 pass, 1 fail')
            }

            res.end(`${cycle}`)
            cycle ++

        } catch(ex){
            res.status(500)
            res.end('Something went wrong - check logs for details.')
            log.error(ex)
        }
    })
}