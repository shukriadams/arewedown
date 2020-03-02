const httpHelper = require('madscience-httputils');

module.exports = async function(watcher){
    let jsonraw = await httpHelper.downloadString(watcher.url),
        containers = JSON.parse(jsonraw.body);

    let containerState = 'Not found.';

    for (let container of containers)
        if (container.Names && container.Names.includes(watcher.containerName) ){
            containerState = container.State;
            containerState = 'not running';
            if (container.State === 'running')
                return;
        }

    throw `"container state : ${containerState}`;
}

