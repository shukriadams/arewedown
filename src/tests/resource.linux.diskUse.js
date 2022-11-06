/**
 * SSHs onto a remote linux host, runs df at a given path, and fails if the % free is below a given threshold   
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

        if (!config.path)
            throw {
                type : 'configError',
                text : '.path required'
            }

        if (!config.threshold)
            throw {
                type : 'configError',
                text : '.threshold required'
            }

        if (config.threshold < 0 || config.threshold > 100)
            throw {
                type : 'configError',
                text : '.threshold must be between 0 and 100'
            }

        if(!parseInt(config.threshold))
            throw {
                type : 'configError',
                text : '.threshold must be and integer'
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
                ssh.exec(`df ${config.path}`, {

                    out: stdout => {
                        
                        stdout = stdout
                        stdout = stdout.split('\n')

                        // expect 2 lines
                        if (stdout.length > 1){
                            
                            // look for percentage
                            const match = stdout[1].match(/ (\d*?)% /i)

                            if (match.length > 1){
                                const usedPercent = parseInt(match[1])
                                
                                if (usedPercent <= config.threshold)
                                    return resolve()
                                else
                                    return reject({
                                        type: 'awdtest.fail',
                                        test : 'resource.linux.diskUse',
                                        text:  `Disk use is ${usedPercent}%, max allowed is ${config.threshold}%.`
                                    })
                            }
                        }

                        reject({
                            type: 'awdtest.fail',
                            test : 'resource.linux.diskUse',
                            text:  `Failed to get valid disk use.`
                        })
                    },

                    err : stderr => {
                        reject({
                            type: 'awdtest.fail',
                            test : 'resource.linux.diskUse',
                            text:  stderr
                        })
                    }

                }).start()
            }catch(ex){
                reject(ex)
            }
        })
    }

}