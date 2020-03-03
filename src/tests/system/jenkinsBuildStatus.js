const httpHelper = require('madscience-httputils');

module.exports = async function(watcher){
    let jsonraw = await httpHelper.downloadString(watcher.url),
        json = null;    

    try {
        json = JSON.parse(jsonraw.body);
    } catch (ex){
        throw `Jenkins returned invalid JSON : ${jsonraw.body}`;
    }

    if (!json || json.result !== 'SUCCESS')      
        throw `Jenkins job has status  "${json.result}"`;
}

