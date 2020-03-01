/**
 * Use to run a single test. Requires --file path argument, and path is relative to tess/tests path
 * F.ex if you want to run the tests in the file test/tests/foo/bar.js use "--file foo/bar"
 */

let Mocha = require('mocha'),
    glob = require('glob'),
    fs = require('fs-extra'),
    process = require('process'),
    argv = require('minimist')(process.argv.slice(2))
    mocha = new Mocha({});

if (!argv.file){
    console.error('--file arg not set');
    process.exit(1);
}

const testPath = `./test/tests/${argv.file}`;
if (!fs.existsSync(`${testPath}.js`)){
    console.error(`File ${testPath} does not exist.`);
    process.exit(1);
}

mocha.addFile(testPath);
mocha.run();