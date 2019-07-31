/**
 * 
 */
let httpHelper = require('./../../lib/httpHelper');

module.exports = async function(job){
    let json = await httpHelper.downloadJSON(job.args.url);
    return json.result === 'SUCCESS';
}

