const request = require('request');

async function checkHTTPResponse (url){
    return new Promise((resolve, reject)=>{
        let code = null;

        request( { uri: url }, 
            function(error, response) {
                if (error)
                    return reject(error);
                
                if (code && (code < 200 || code >= 300)) // allow all code 2**
                    return reject(`Error : server responded with code ${code}.`);

                resolve(response);
            }
        ).on('response', function(response) {
            code = response.statusCode;
        })
    });
};

module.exports = async function(job){
    await checkHTTPResponse(job.config.url);
}
