module.exports = express => {

    /**
     *
     */
    express.get('/diagnostics/transport/:transport/:recipient', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            const settings = require('./../lib/settings').get(),
                recipient = settings.recipients[req.params.recipient],
                smtp = require('./../lib/smtp'),
                slack = require('./../lib/slack'),
                transportHandlers = {
                    smtp,
                    slack
                },
                transportHandler = transportHandlers[req.params.transport]

            if (!settings.transports[req.params.transport])
                return res.end(`Transport ${req.params.transport} does not exist or is disable`)

            if (!settings.transports[req.params.transport].diagnostics)
                return res.end(`Transport ${req.params.transport} has diagnostics disabled. Add "diagnostics: true" to this node, and restart Are We Down?`)

            if (!recipient)
                return res.end(`Recipient ${req.params.recipient} does not exist or is disable`)

            if (!transportHandler)
                return res.end(`Transport ${req.params.transport} is not supported by Are We Down?`)

            const result = await transportHandler.test(recipient[req.params.transport])
            res.end(`${result}`)

        } catch (ex){
            log.error(ex)
            res.status(500)
            res.end('Something went wrong - check logs for details.')
        }
    })
}