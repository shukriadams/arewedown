// url for this job should be :
// http://<myjenkins>/job/<myjob>/lastBuild/api/json
// or
// http://user:password@<myjenkins>/job/<myjob>/lastBuild/api/json


module.exports = async function(config){
    const httpHelper = require('madscience-httputils'),
        urljoin = require('urljoin')

    // validate settings
    if (!config.host && !config.url)
        throw {
            type : 'configError',
            text : '.host required'
        }

    if (!config.job)
        throw {
            type : 'configError',
            text : '.job required'
        }        
    

    // check if jenkins server host is valid
    let check,
        host = config.host || config.url

    try {
        check = await httpHelper.downloadString(host)
    } catch (ex) {
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  `Jenkins Host is invalid`
        }
    }

    if (check.statusCode !== 200)
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  `Host returned status "${check.statusCode}".`
        }

    let url = urljoin(host, 'job', encodeURIComponent(config.job), 'lastBuild/api/json'),
        jsonraw = null, 
        json = null
    
    try {
        jsonraw = await httpHelper.downloadString(url)
    } catch(ex){
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  JSON.stringify(ex)
        }
    }
    
    if (jsonraw.statusCode === 404)
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  `Job "${config.job}" not found`
        }

    try {
        json = JSON.parse(jsonraw.body)
    } catch (ex){
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  'Jenkins returned invalid JSON'
        }
    }

    const allowedStatusus = (config.status || 'success').split(',').filter(r => !!r)

    if (!json || !json.result || !allowedStatusus.includes(json.result.toLowerCase()))      
        throw{
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text: `Jenkins job has unwanted status "${json.result.toLowerCase()}".`
        }
}

