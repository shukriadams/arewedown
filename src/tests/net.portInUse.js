/**
 * Uses Netcat to check if a TCP port is in use
 */
const NetcatClient = require('netcat/client')

module.exports = async function(config){
    // validate settings
    if (!config.url)
        throw {
            type : 'configError',
            text : '.url required'
        }

    if (!config.host)
        throw {
            type : 'configError',
            text : '.host required'
        }

    if (!config.port)
        throw {
            type : 'configError',
            text : '.port required'
        }

    return new Promise((resolve, reject)=>{
        try {
            const nc = new NetcatClient()
            nc.addr(config.host).scan(config.port, function(ports){
                if (ports[config.port] === 'open')
                    return resolve('port open')

                return reject('port closed')
            })
        }catch(ex){
            reject(ex)
        }
    })
}
