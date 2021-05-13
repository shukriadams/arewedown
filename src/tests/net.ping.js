/**
 * 
 */
const ping = require('ping')

module.exports = async config => {
    // validate settings
    if (!config.host)
        throw {
            type : 'configError',
            text : '.host required'
        }

    const response = await ping.promise.probe(config.host)
    if (response.alive)
        return

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
