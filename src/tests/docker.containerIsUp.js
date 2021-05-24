/**
 * Does a docker Engine API query @ watcher.host, expects to find a running container with name 
 * watcher.container.
 */
module.exports = async config =>{
    const httpHelper = require('madscience-httputils'),
        urljoin = require('urljoin')

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
            test : 'docker.containerIsUp',
            text:  `Host is invalid: ${ex.toString()}`
        }
    }        

    if (jsonraw.statusCode !== 200)
        throw {
            type: 'awdtest.fail',
            test : 'docker.containerIsUp',
            text:  `Host returned status "${jsonraw.statusCode}".`
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
                test : 'docker.containerIsUp',
                text:  `container state is "${containerState}"`
            }                
        }

    throw {
        type: 'awdtest.fail',
        test : 'docker.containerIsUp',
        text:  `Container "${config.container}" not found.`
    }
}