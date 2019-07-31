/**
 * Tests are expected to return a boolean - true if the test passed, else false.
 * Tests using native async. The Request library is included to help with with http requests.
 * Use response to get data from http request, ex: response.body
 * Return true if test passed, false if failed.
 * set job.errorMessage for details of failure. 
 */

const request = require('request');

async function downloadString(url){
    return new Promise((resolve, reject)=>{
        request( { uri: url }, 
            function(error, response) {
                if (error)
                    return reject(error);

                resolve(response);
            }
        )
    });
};
    
module.exports = async function(job){
    let response = await downloadString(job.url);
    return response.body === 'some expected text';
}