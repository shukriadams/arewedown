module.exports = express => {

    /**
     * Exposes .test method on transports. Use to verify that transport config works.
     */
    express.get('/diagnostics/transport/:transport/:recipient', async (req, res)=>{
        const log = require('./../lib/logger').instance()

        try {
            const settings = require('./../lib/settings').get(),
                recipient = settings.recipients[req.params.recipient],
                transportHandlers = require('./../lib/transports').getTransportHandlers(),
                transportHandler = transportHandlers[req.params.transport]

            if (!settings.transports[req.params.transport])
                return res.end(`Transport ${req.params.transport} does not exist or is disable`)

            if (!settings.transports[req.params.transport].diagnostics)
                return res.end(`Transport ${req.params.transport} has diagnostics disabled. Add "diagnostics: true" to "${req.params.transport}", and restart Are We Down?`)

            if (!recipient)
                return res.end(`Recipient ${req.params.recipient} does not exist or is disable`)

            const result = await transportHandler.test(recipient[req.params.transport])
            /* istanbul ignore next : cover not working for this line */
            res.end(result)
        } catch (ex) {
            /* istanbul ignore next : cover not working for these 3 lines */
            log.error(ex)
            /* istanbul ignore next : cover not working for these 3 lines */
            res.status(500)
            /* istanbul ignore next : cover not working for these 3 lines */
            res.end(`An error occurred : ${JSON.stringify(ex)}`)
        }
    })
}