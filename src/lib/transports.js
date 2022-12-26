module.exports = {

    transportHandlers : null,

    /**
     * Private use only.
     */
    _ensureHandlers(){
        if (this.transportHandlers == null){
            const smtp = require('./smtp/smtp'),
                slack = require('./slack')
    
            this.transportHandlers = {
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

        return this.transportHandlers
    },


    /**
     * 
     */
    async ensureQueue(){
        const fs = require('fs-extra'),
            path = require('path'),
            settings = require('./settings').get()

        this._ensureHandlers()

        for (let transportName in this.transportHandlers){
            let queuePath

            try {
                queuePath = path.join(settings.queue, transportName)
                await fs.ensureDir(queuePath)
            } catch (ex) {
                console.log(`Error creating queue dir ${queuePath}`)
            }
        }
    },

    /**
     * For testing - need to be able to shim process safely without monkeypatching
     * actual process 
     */
    _getProcess(){
        const process = require('process')
        return process
    },

    /**
     * validate active transport's settings by attempting to contact provider. throws unhandled exception on fail, this should
     * intentionally take application down 
     */
    async enureSettingsValidOrExit(){
        const settings = require('./settings').get(),
            process = this._getProcess()

        this._ensureHandlers()

        for (const transportName in settings.transports){
            const transport = this.transportHandlers[transportName]

            try {
                await transport.validateSettings()
            } catch (ex) {
                /* ignore coverage, process.exit makes this tricky to test */
                console.log(ex)
                console.log('ERROR : transport validation failed, app will exit')
                process.exit(1)
            }
        }
    }
}