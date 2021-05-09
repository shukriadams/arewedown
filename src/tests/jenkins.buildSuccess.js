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
    try {
        const check = await httpHelper.downloadString(config.url)
        if (check.statusCode === 404)
            throw {
                type: 'awdtest.fail',
                test : 'jenkins.buildSuccess',
                text:  `Jenkins URL unreachable`
            }
    } catch (ex) {
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  `Jenkins URL is invalid`
        }
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

    if (!json || json.result !== 'SUCCESS')      
        throw{
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text: `Jenkins job has unwanted status "${json.result}".`
        }
}

