/**
 * Performs a simple HTTP lookup of watcher.url. Any HTTP code between 200 and 299 will count
 * as a test pass, all else will fail
 */


// attempts to reach the given url, throws exception if does not receive 200 response
module.exports = async config => {
    // validate settings
    if (!config.url && !config.host)
        throw {
            type : 'configError',
            text : '.host required'
        }
        
    const host = config.url || config.host

    if (!host.toLowerCase().startsWith('http://') && !host.toLowerCase().startsWith('https://'))
        throw {
            type : 'configError',
            text : '.host must start with "http(s)://"'
        }

    let receivedStatus = 'no status',
        got = require('got')

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
        text : `Expected HTTP code ${expectedCode}, got ${response.statusCode}.`
    }
}
