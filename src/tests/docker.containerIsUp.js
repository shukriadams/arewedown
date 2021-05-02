/**
 * Does a docker Engine API query @ watcher.url, expects to find a running container with name 
 * watcher.containerName.
 */
const httpHelper = require('madscience-httputils')

module.exports = async function(config){
    if (!config.url)
        throw {
            type : 'configError',
            text : '.url required'
        }

    if (!config.containerName)
        throw {
            type : 'configError',
            text : '.containerName required'
        }

    let jsonraw = await httpHelper.downloadString(config.url),
        containers = JSON.parse(jsonraw.body)
        containerState = 'Not found'

    for (let container of containers)
        if (container.Names && container.Names.includes(config.containerName) ){
            
            containerState = container.State
            if (container.State === 'running')
                return
        }

    throw {
        type: 'awdtest.fail',
        test : 'net.portInUse',
        text:  `"Unexpected container state "${containerState}"`
    }
    
}