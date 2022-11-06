/**
 * Dead man's switch test - ssh's to a machine and reads a file at expected location. The file should contain an ISO date.
 * Fails if the file does not exist or if the date in the file is older than an allowed range.
 * 
 * To generate a date file use the standard Linux shell command
 * echo $(date --iso-8601=seconds) >> /path/to/myfile
 * 
 * The date in the file should look like
 * 
 * 2022-11-06T10:59:28+00:00 
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
                text : '.path required - This is the path to the date file on the ssh target'
            }

        if (!config.range)
            throw {
                type : 'configError',
                text : '.range format is required - must be a number followed by one of S(econds), M(inutes), H(ours) or D(ays), ex. 10S, 24H, or 7D.'
            }

        const rangeLookup = config.range.trim().match(/^(\d+)(S|M|H|D)$/i)
        if (rangeLookup.length !== 3)
            throw {
                type : 'configError',
                text : `The provided range "${config.range}" is invalid - must be a number followed by one of S(econds), M(inutes), H(ours) or D(ays), ex. 10S, 24H, or 7D.`
            }
    },

    async run(config) {
        let SSH = require('simple-ssh'),
            timebelt = require('timebelt'),
            rangeLookup = config.range.trim().match(/^(\d+)(S|M|H|D)$/i),
            range = rangeLookup[1],
            rangeUnit = rangeLookup[2].toLowerCase(),
            minAllowedDate = null,
            ssh = new SSH({
                host: config.host,
                user: config.user,
                pass: config.password
            })            
        
        if (rangeUnit === 's')
            minAllowedDate = timebelt.addSeconds(new Date(), -1 * range)
        else if (rangeUnit === 'm')
            minAllowedDate = timebelt.addMinutes(new Date(), -1 * range)
        else if (rangeUnit === 'h')
            minAllowedDate = timebelt.addHours(new Date(), -1 * range)
        else if (rangeUnit === 'd')
            minAllowedDate = timebelt.addDays(new Date(), -1 * range)

        return new Promise((resolve, reject)=>{
            try {
                ssh.exec(`cat ${config.path}`, {
                    out: async stdout => {
                        stdout = stdout.trim()

                        let parsedDate = null
                        try {
                            parsedDate = new Date(stdout)
                            if (isNaN(parsedDate))
                                return reject({
                                    type: 'awdtest.fail',
                                    test : 'general.dataInFile',
                                    text: stdout ? `Remote file content "${stdout}" is not a DateTime` : "Remote file is empty" 
                                })        
                        } catch(ex){
                            return reject({
                                type: 'awdtest.fail',
                                test : 'general.dataInFile',
                                text: `Remote file content "${stdout}" is not a DateTime : ${ex}` 
                            })        
                        }

                        if (parsedDate < minAllowedDate)
                            return reject({
                                type: 'awdtest.fail',
                                test : 'general.dataInFile',
                                text: `Expected date "${parsedDate}" is too old` 
                            })                    

                        return resolve()
                    },

                    err: stderr => {
                        return reject({
                            type: 'awdtest.fail',
                            test : 'general.dataInFile',
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