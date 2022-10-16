/**
 * Internal test, for development only.
 */
 module.exports = async config => {

    // validate settings
    if (!config.path)
        throw {
            type : 'configError',
            text : '.path required'
        }

    const fs = require('fs-extra')

    if (await fs.exists(config.path))
        return

    throw {
        type: 'awdtest.fail',
        test: 'internal.fileExists',
        text: `${config.path} not found` 
    }
}
