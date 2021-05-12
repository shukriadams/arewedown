/**
 * Does a docker Engine API query @ watcher.host, expects to find a running container with name 
 * watcher.container.
 */
const httpHelper = require('madscience-httputils'),
    urljoin = require('urljoin')

module.exports = async function(config){
    if (!config.host)
        throw {
            type : 'configError',
            text : '.host required'
        }

    if (!config.container)
        throw {
            type : 'configError',
            text : '.container required'
        }

    let port = config.port || 2375,
        jsonraw

    try {
        jsonraw = await httpHelper.downloadString(urljoin(`${config.host}:${port}`, 'containers/json'))
    } catch (ex) {
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  `Host is invalid: ${ex.toString()}`
        }
    }        

    if (jsonraw.statusCode === 404)
        throw {
            type: 'awdtest.fail',
            test : 'jenkins.buildSuccess',
            text:  `Host unreachable`
        }

    containers = JSON.parse(jsonraw.body),
    containerState = `Container "${config.container}" not found or down`

    for (let container of containers)
        if (container.Names && container.Names.includes(`/${config.container}`) ){
            
            containerState = container.State
            if (container.State === 'running')
                return

            throw {
                type: 'awdtest.fail',
                test : 'net.portInUse',
                text:  `container state is "${containerState}"`
            }                
        }

    throw {
        type: 'awdtest.fail',
        test : 'net.portInUse',
        text:  containerState
    }
    
}