const httpUtils = require('madscience-httputils');

module.exports = async function(job){
    let response = await httpUtils.downloadString(job.config.url);

    if (response.body !== 'some expected text')
        throw `Unexpected text : ${response.body}`;
}
