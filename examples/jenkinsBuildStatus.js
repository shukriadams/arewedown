/**
 * 
 */
let httpHelper = require('./../../lib/httpHelper');

module.exports = async function(job){
    let json = await httpHelper.downloadJSON(job.url);
    return json.result === 'SUCCESS';
}

