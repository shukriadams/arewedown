To run an individual test run use the following

    npm test -- -g "some test name"

where test name is defined in unit test code in

    it('<TEST-NAME-HERE>', async() => { ...

or

    describe('<TEST-NAMES-HERE>', async() => { ...