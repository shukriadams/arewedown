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

        if (!config.pool)
            throw {
                type : 'configError',
                text : '.pool required'
            }
    },

    async run(config){
        const SSH = require('simple-ssh'),
            ssh = new SSH({
                host: config.host,
                user: config.user,
                pass: config.password
            })

        return new Promise((resolve, reject)=>{
            try {
                ssh.exec(`zpool status ${config.pool}`, {

                    out: stdout => {
                        stdout = stdout.trim()
                        if (stdout.includes('state: ONLINE'))
                            return resolve()

                        reject({
                            type: 'awdtest.fail',
                            test : 'filesystem.zfs.zpoolStatus',
                            text:  `Pool "${config.pool}" status is ${stdout}.`
                        })
                    },

                    err: stderr => {
                        return reject({
                            type: 'awdtest.fail',
                            test : 'filesystem.zfs.zpoolStatus',
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