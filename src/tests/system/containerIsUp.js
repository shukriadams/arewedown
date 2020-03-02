const httpHelper = require('madscience-httputils');

module.exports = async function(job){
    let jsonraw = await httpHelper.downloadString(job.config.url),
        containers = JSON.parse(jsonraw.body);
        
    for (let container of containers)
        if (container.Names && container.Names.includes(job.config.containerName) && container.State === 'running')
            return;

    throw `"container : ${container.State}`;
}

