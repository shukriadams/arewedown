const httpHelper = require('madscience-httputils');

module.exports = async function(job){
    let jsonraw = await httpHelper.downloadString(job.config.url),
        json = null;    

    try {
        json = JSON.parse(jsonraw.body);
    } catch (ex){
        console.log(ex, job.config.url, jsonraw.body);
        console.log(jsonraw.body);
        throw 'Invalid JSON check logs';
    }

    if (!json || json.result !== 'SUCCESS')      
        throw "Jenkins status:" + json.result;
}

