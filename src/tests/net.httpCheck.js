/**
 * Performs a simple HTTP lookup of watcher.url. Any HTTP code between 200 and 299 will count
 * as a test pass, all else will fail
 */
module.exports = {
    
    validateConfig(config){
        if (!config.url && !config.host)
            throw {
                type : 'configError',
                text : '.host required'
            }
    },

    async run(config){

        let got = require('got'),
            settings = require('./../lib/settings').get(),
            httpHelper = require('madscience-httputils'),
            host = httpHelper.ensureProtocol(config.url || config.host, settings.defaultTestProtocol),
            receivedStatus = 'no status'

        try {
            const response = await got(host)
            receivedStatus = response.statusCode

        } catch(ex){
            // fail outright
            if (ex.code === 'ENOTFOUND' || ex.code === 'EAI_AGAIN')  
                throw {
                    type: 'awdtest.fail',
                    test : 'net.httpCheck',
                    text:  `${host} could not be reached.`
                }

            if (ex.response)
                receivedStatus = ex.response.statusCode
        }
        
        const expectedStatus = config.code ? config.code : 200
        if (receivedStatus === expectedStatus)
            return 

        throw { 
            type : 'awdtest.fail', 
            test : 'net.httpCheck',
            text : `Expected HTTP code ${expectedStatus}, got ${receivedStatus}.`
        }
    }
}