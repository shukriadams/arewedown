let fs = require('fs'),
    process = require('process'),
    packageJson = fs.readFileSync('./.stage/src/package.json')

function getArg(arg){
    for (let i = 0 ; i < process.argv.length ; i ++)
        if (process.argv[i] == `--${arg}` && process.argv.length >= i)
            return process.argv[i + 1]
    return null
}
    
packageJson = JSON.parse(packageJson)
packageJson.version = getArg('version')

fs.writeFileSync('./.stage/src/package.json', JSON.stringify(packageJson, null, 4))

