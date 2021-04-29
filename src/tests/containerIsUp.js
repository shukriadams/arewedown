/**
 * Does a docker Engine API query @ watcher.url, expects to find a running container with name 
 * watcher.containerName.
 */
const httpHelper = require('madscience-httputils')

module.exports = async function(watcher){
    let jsonraw = await httpHelper.downloadString(watcher.url),
        containers = JSON.parse(jsonraw.body)
        containerState = 'Not found'

    for (let container of containers)
        if (container.Names && container.Names.includes(watcher.containerName) ){
            
            containerState = container.State
            if (container.State === 'running')
                return
        }

    throw `"Unexpected container state "${containerState}"`
}