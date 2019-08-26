let nodexec = require('madscience-node-exec');

module.exports = async function(job){

    let response = await nodexec({
        cmd : 'curl',
        args : [
            '-s', // run silent or curl's verbose chatter will be seen as error
            '-someArg', 
            'http://example.com'
        ]
    });

    if (response != 'some expected value')
        throw 'Invalid response received';

    return true;
}
