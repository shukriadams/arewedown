// use : node writeVersion --version <TAG> --path <path-to-package.json>
let fs = require('fs'),
    getArg = require('./node/getArg'),
    packagePath = getArg('path'),
    version = getArg('version'),
    packageJson = fs.readFileSync(packagePath)

packageJson = JSON.parse(packageJson)
packageJson.version = version

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4))