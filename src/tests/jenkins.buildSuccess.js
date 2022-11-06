// url for this job should be :
// http://<myjenkins>/job/<myjob>/lastBuild/api/json
// or
// http://user:password@<myjenkins>/job/<myjob>/lastBuild/api/json
module.exports = {
    
    validateConfig(config){
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
        
    },

    async run(config){
        let httpHelper = require('madscience-httputils'),
            settings = require('./../lib/settings').get(),
            urljoin = require('urljoin'),
            check,
            host = httpHelper.ensureProtocol(config.host || config.url, settings.defaultTestProtocol),
            url = urljoin(host, 'job', encodeURIComponent(config.job), 'lastBuild/api/json'),
            jsonraw = null, 
            json = null

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

        // if result is null, build is in progress, ignore
        if (json.result && !allowedStatusus.includes(json.result.toLowerCase()))      
            throw{
                type: 'awdtest.fail',
                test : 'jenkins.buildSuccess',
                text: `Jenkins job has unwanted status "${json.result}".`
            }
    }
}