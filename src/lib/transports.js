let transportHandlers = null

module.exports = {


    /**
     * Private use only.
     */
    _ensureHandlers(){
        if (transportHandlers == null){
            const smtp = require('./smtp'),
                slack = require('./slack')
    
            transportHandlers = {
                smtp,
                slack
            }
        }
    },


    /**
     * Simple getter for transportHandlers
     */
    getTransportHandlers(){
        this._ensureHandlers()

        return transportHandlers
    },


    /**
     * 
     */
    async ensureQueue(){
        this._ensureHandlers()
        const fs = require('fs-extra'),
            path = require('path'),
            settings = require('./settings').get()

        for (let transportName in transportHandlers)
            await fs.ensureDir(path.join(settings.queue, transportName))
    },


    /**
     * validate active transport's settings by attempting to contact provider. throws unhandled exception on fail, this should
     * intentionally take application down 
     */
         async validateAll(){
            const settings = require('./settings').get()
    
            for (const transportName in settings.transports){
                const transport = require(`./${transportName}`)
                if (!transport.ensureSettingsOrExit)
                    throw `transport method "${transportName}" missing expected method "ensureSettingsOrExit"`
    
                await transport.ensureSettingsOrExit()
            }
        }
}