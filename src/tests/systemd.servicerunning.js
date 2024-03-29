/**
 * SSHs onto a remote host to determine if a system.d process is running.
 */
module.exports = {
    validateConfig(config){
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
    },

    async run(config){
        const SSH = require('simple-ssh'),
            ssh = new SSH({
                host: config.host,
                user: config.user,
                pass: config.password,
                port: config.port || 22
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
                    },

                    err: stderr => {
                        return reject({
                            type: 'awdtest.fail',
                            test : 'systemd.servicerunning',
                            text: stderr
                        })   
                    }                

                }).start()
            }catch(ex){
                reject(ex)
            }
        })
    }
}
