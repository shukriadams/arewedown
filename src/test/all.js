/**
 * Mocha tests expect to be run from the mocha cli, making debugging difficult if your debugger wants to run tests
 * directly from node. This file is a workaround for that - you can debug this file directly, it will in turn fire up
 * mocha and run all tests in the ./tests folder.
 *
 * Confirmed working in Webstorm, also with breakpoints in any test file or any server file hidden behind the API.
 */

let Mocha = require('mocha'),
    glob = require('glob'),
    tests = glob.sync('./test/tests/**/*.js'),
    mocha = new Mocha({});

for (let i = 0 ; i < tests.length ; i ++){
    // slice removes .js file extension, which mocha doesn't want
    mocha.addFile(tests[i].slice(0, -3));
}

mocha.run();