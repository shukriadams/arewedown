/**
 * Performs a simple HTTP lookup of watcher.url. Any HTTP code between 200 and 299 will count
 * as a test pass, all else will fail
 */
const request = require('request'),

    // attempts to reach the given url, throws exception if does not receive 200 response
    ensureReachable = async (config)=>{
        return new Promise((resolve, reject)=>{
            try {
                let code = 0
                request( { uri: config.url }, 
                    function(error, response) {
                        if (error){
                            if (error.errno === 'ENOTFOUND' || error.errno === 'EAI_AGAIN')  
                                return reject({
                                    type: 'awdtest.fail',
                                    test : 'net.httpCheck',
                                    text:  `${config.url} could not be reached.`
                                })
    
                            return reject(error)
                        }

                        let pass = false,
                            expectedCode = ''

                        if (config.code){
                            expectedCode = config.code
                            pass = code === config.code
                        } else {
                            expectedCode='2**'
                            pass = code >= 200 && code <= 299 // allow all code 2**
                        }

                        if (!pass)
                            return reject({ 
                                type : 'awdtest.fail', 
                                test : 'net.httpCheck',
                                text : `Expected HTTP code ${expectedCode}, got ${code}.`
                            })
    
                        resolve(response)
                    }
                ).on('response', function(response) {
                    code = response.statusCode
                })
            } catch(ex){
                reject(ex)
            }
        })
    }

module.exports = async function(config){
    // validate settings
    if (!config.url)
        throw {
            type : 'configError',
            text : '.url required'
        }

    await ensureReachable(config)
}
