const httpUtils = require('madscience-httputils');

module.exports = async function(job){
    await httpUtils.downloadString(job.config.url);
}
