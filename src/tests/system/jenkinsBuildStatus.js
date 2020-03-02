const httpHelper = require('madscience-httputils');

module.exports = async function(watcher){
    let jsonraw = await httpHelper.downloadString(watcher.url),
        json = null;    

    try {
        json = JSON.parse(jsonraw.body);
    } catch (ex){
        console.log(ex, watcher.url, jsonraw.body);
        console.log(jsonraw.body);
        throw 'Invalid JSON check logs';
    }

    if (!json || json.result !== 'SUCCESS')      
        throw "Jenkins status:" + json.result;
}

