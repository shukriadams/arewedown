const process = require('process')

module.exports = (arg) => {
    for (let i = 0 ; i < process.argv.length ; i ++)
        if (process.argv[i] == `--${arg}` && process.argv.length >= i)
            return process.argv[i + 1]

    throw `Expected arg --${arg} not set`
}