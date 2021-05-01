const httpHelper = require('madscience-httputils')

module.exports = async function(config){
    // validate settings
    if (!config.url)
        throw {
            type : 'configError',
            text : '.url required'
        }

    let jsonraw = await httpHelper.downloadString(config.url),
        json = null

    try {
        json = JSON.parse(jsonraw.body)
    } catch (ex){
        throw `Jenkins returned invalid JSON : ${jsonraw.body}`
    }

    if (!json || json.result !== 'SUCCESS')      
        throw `Jenkins job has status  "${json.result}"`
}

