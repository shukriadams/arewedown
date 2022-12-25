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
            

        for (let transportName in transportHandlers){
            let queuePath
            try
            {
                queuePath = path.join(settings.queue, transportName)
                await fs.ensureDir(queuePath)
            } 
            catch (ex)
            {
                console.log(`Error creating queue dir ${queuePath}`)
            }
        }
    },


    /**
     * validate active transport's settings by attempting to contact provider. throws unhandled exception on fail, this should
     * intentionally take application down 
     */
         async enureSettingsValidOrExit(){
            const settings = require('./settings').get(),
                process = require('process')
    
            for (const transportName in settings.transports){
                const transport = require(`./${transportName}`)
                try {
                    await transport.validateSettings()
                } 
                catch (ex)
                {
                    console.log(ex)
                    console.log('ERROR : transport validation failed, app will exit')
                    process.exit(1)
                }
            }
        }
}