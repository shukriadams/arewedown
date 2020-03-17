/**
 * Uses Netcat to check if a TCP port is in use
 */
const NetcatClient = require('netcat/client');

module.exports = async function(watcher){
    if (!watcher.host)
        throw `Watcher "${watcher.__name}" is missing a "host" entry.`;

    if (!watcher.port)
        throw `Watcher "${watcher.__name}" is missing a "port" entry.`;

    return new Promise((resolve, reject)=>{
        try {
            const nc = new NetcatClient();
            nc.addr(watcher.host).scan(watcher.port, function(ports){
                if (ports[watcher.port] === 'open')
                    return resolve('port open');

                return reject('port closed');
            })
        }catch(ex){
            reject(ex);
        }
    });
}
