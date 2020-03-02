/**
 * Simple scaffold to run mocha tests on an express server instance.
 */
module.exports = function(testName, tests){

    describe(testName, function() {

        this.timeout(5000);

        // run tests for file
        tests({
            foo : 'bar'
        });

        beforeEach(function(done) {
            (async ()=>{
                done();
            })();
        });

        afterEach(function(done){
            done();
        });
    });
};