module.exports = {
    get(){
        const process = require('process'),
            minimist = require('minimist')
    
        return minimist(process.argv.slice(2))
    }
}

