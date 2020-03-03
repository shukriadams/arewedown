/**
 * Performs a simple HTTP lookup of watcher.url. Any HTTP code between 200 and 299 will count
 * as a test pass, all else will fail
 */
const request = require('request');

module.exports = async function(watcher){
    if (!watcher.url)
        throw `Watcher "${watcher.__name}" is missing a url. test/system/basic requires a url`;

    return new Promise((resolve, reject)=>{
        let code = null;

        request( { uri: watcher.url }, 
            function(error, response) {
                if (error){
                    if (error.errno === 'ENOTFOUND' || error.errno === 'EAI_AGAIN')  
                        error = `${watcher.url} could not be reached.`;

                    return reject(error);
                }
                
                if (code && (code < 200 || code > 299)) // allow all code 2**
                    return reject(`Unexpected HTTP code ${code}`);

                resolve(response);
            }
        ).on('response', function(response) {
            code = response.statusCode;
        })
    });
}
