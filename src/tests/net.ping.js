/**
 * Pings a host.
 */
module.exports = async config => {
    const ping = require('ping')

    // validate settings
    if (!config.host)
        throw {
            type : 'configError',
            text : '.host required'
        }

    
    const response = await ping.promise.probe(config.host, {
        timeout : config.timeout || 10, // in seconds
    })

    if (response.alive)
        return

    // output is multiline, merge into single line, remove first two entries
    const output = response.output
        .split('\n')
        .filter(r => !!r)
        .slice(2)
        .join(',')

    throw {
        type: 'awdtest.fail',
        test : 'net.ping',
        text: `${config.host} - ${output}` 
    }
}
