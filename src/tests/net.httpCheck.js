/**
 * Performs a simple HTTP lookup of watcher.url. Any HTTP code between 200 and 299 will count
 * as a test pass, all else will fail
 */
const request = require('request'),
    // attempts to reach the given url, throws exception if does not receive 200 response
    ensureReachable = async (url)=>{
        return new Promise((resolve, reject)=>{
            try {
                let code = null
                request( { uri: url }, 
                    function(error, response) {
                        if (error){
                            if (error.errno === 'ENOTFOUND' || error.errno === 'EAI_AGAIN')  
                                error = `${watcher.url} could not be reached.`
    
                            return reject(error)
                        }
                        
                        if (code && (code < 200 || code > 299)) // allow all code 2**
                            return reject(`Unexpected HTTP code ${code}`)
    
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

    await ensureReachable(config.url)
}
