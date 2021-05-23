/**
 * 
 */




module.exports = async function(config){
    const SSH = require('simple-ssh')
    
    // validate settings
    if (!config.host)
        throw {
            type : 'configError',
            text : '.host required'
        }

    if (!config.user)
        throw {
            type : 'configError',
            text : '.user required'
        }

    if (!config.password)
        throw {
            type : 'configError',
            text : '.password required'
        }

    if (!config.service)
        throw {
            type : 'configError',
            text : '.service required'
        }

    const ssh = new SSH({
        host: config.host,
        user: config.user,
        pass: config.password
    })

    return new Promise((resolve, reject)=>{
        try {
            ssh.exec(`systemctl show -p SubState --value ${config.service}`, {
                out: stdout => {
                    stdout = stdout.trim()
                    if (stdout === 'running')
                        return resolve()

                    reject({
                        type: 'awdtest.fail',
                        test : 'systemd.servicerunning',
                        text:  `Service "${config.service}" not running.`
                    })
                }
            }).start()
        }catch(ex){
            reject(ex)
        }
    })
}


