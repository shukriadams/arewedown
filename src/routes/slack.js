module.exports = express => {
    let settings = require('./../lib/settings').get()
    /**
     * Tests slack integration by sending a message to the target user / channel, then deleting it. 
     */
    express.get(`${settings.rootpath}slack/test/:target`, async (req, res)=>{
        const slack = require('./../lib/slack')

        try {
             
            const result = await slack.send(req.params.target, 'slack integrtion test', true)
            const deleteResult = await slack.delete(req.params.target, result.ts)
            if (!deleteResult.ok)
                throw deleteResult

            res.json( { message : 'Slack integration test passed.' })
        }catch(ex){
            res.status(500)
            res.json({
                message : 'Sending a message to Slack target failed with error : ',
                ex
            })
        }
    })

}