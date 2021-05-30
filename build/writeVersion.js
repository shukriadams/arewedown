// use : node writeVersion --version <TAG> --path <path-to-package.json>
let fs = require('fs'),
    getArg= arg =>{
        for (let i = 0 ; i < process.argv.length ; i ++)
            if (process.argv[i] == `--${arg}` && process.argv.length >= i)
                return process.argv[i + 1]

        throw `Expected arg --${arg} not set`
    },
    process = require('process'),
    packagePath = getArg('path'),
    version = getArg('version'),
    packageJson = fs.readFileSync(packagePath)

packageJson = JSON.parse(packageJson)
packageJson.version = version

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 4))