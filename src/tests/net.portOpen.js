/**
 * Uses Netcat to check if a TCP port is in use
 */


module.exports = async function(config){
    const NetcatClient = require('netcat/client')

    // validate settings
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
            nc.addr(config.host).scan(config.port, ports =>{
                if (ports[config.port] === 'open')
                    return resolve()

                return reject({
                    type: 'awdtest.fail',
                    test : 'net.portInUse',
                    text:  `Port "${config.port}" closed.`
                })
            })
        }catch(ex){
            reject(ex)
        }
    })
}
