const request = require('request');

module.exports = {

    downloadString : async function(url){
        return new Promise((resolve, reject)=>{
            request( { uri: url }, 
                function(error, response) {
                    if (error)
                        return reject(error);

                    resolve(response);
                }
            )
        });
    },

    downloadJSON : async function(url){
        let raw = await this.downloadString(url);
        return JSON.parse(raw.body);
    }
}