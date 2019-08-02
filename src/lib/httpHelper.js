const request = require('request');

module.exports = {

    downloadString : async function(url){
        return new Promise((resolve, reject)=>{
            let code = null;

            request( { uri: url }, 
                function(error, response) {
                    if (error)
                        return reject(error);

                    if (code && code > 200 && code < 299) // allow all code 2**
                        return reject(`Error : server responded with code ${code}.`);

                    resolve(response);
                }
            ).on('response', function(response) {
                code = response.statusCode;
            })
        });
    },

    downloadJSON : async function(url){
        let raw = await this.downloadString(url);
        return JSON.parse(raw.body);
    }
}