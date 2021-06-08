let getArg = require('./node/getArg'),
    process = require('process'),
    version =  getArg('version')

version = version.match(/^([\d]+.[\d]+).[\d]+$/)

if (!version)
    return process.exit(0)

process.stdout.write(version.pop())
