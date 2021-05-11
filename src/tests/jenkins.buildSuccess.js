// url for this job should be :
// http://<myjenkins>/job/<myjob>/lastBuild/api/json
// or
// http://user:password@<myjenkins>/job/<myjob>/lastBuild/api/json
const httpHelper = require('madscience-httputils'),
    urljoin = require('urljoin')

module.exports = async function(config){
    // validate settings
    if (!config.url)
        throw {
            type : 'configError',
            text : '.url required'
        }

    if (!config.job)
        throw {
            type : 'configError',
            text : '.job required'
        }        
    

    // check if jenkins server url is valid
    let check
    try {
        check = await httpHelper.downloadString(config.url)
    } catch (ex) {
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  `Jenkins URL is invalid`
        }
    }

    if (check.statusCode === 404)
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  `Jenkins URL unreachable`
        }

    let url = urljoin(config.url, 'job', encodeURIComponent(config.job), 'lastBuild/api/json'),
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

