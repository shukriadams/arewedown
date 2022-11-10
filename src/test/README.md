# Arewedown? Unit Tests

## Organization

- Units tests are organized for ease of reading and maintainability. 
- Each target file being tested has a corresponding directory nested in this directory.
- Each test directory contains a file for each function in the target file.
- The describe block at the top of each test file repeats the directory name of the test file, egs

        describe('lib/server/loadRoutes' ...)

  is in the test file in `test/lib/server/loadRoutes`, and contains tests for the `loadRoutes` function in the target file `src/lib/server.js`
- Each unit tests repeats the describe() name which the test is nested under, if it is a happy|unhappy|cover, and a very brief description of the test, egs

        it('lib/server/loadRoutes::happy::loads routes without error' ...)

  This tests the `loadRoutes` function in `lib/server`, covers the happy path, and describes that the happy path in this case
  involves loading all routes without error.
- testing makes heavy use of monkey patch mocking, this is done by overriding NodeJS's own `require` command with a custom one. In this way we can inject a mock
 object at a given require path, and any call to require for that path will return the mock.
- `happy` tests cover the pathway where some "passing" result is expected and asserted
- `unhappy` tests cover error-handling and normally assert expected exceptions
- `cover` tests normally don't assert anything, but should not fail, and contribute towards the Istanbul test cover
- test coverage is expected to be at 100% - `npm run cover` will fail if coverage threshhold is below that. This is enforced on live builds as well, coverage itself doesn't prove the project is working, but at least ensures stupid mistakes like assigning to consts and formatting isn't breaking the code. 
- `context.js` in this directory contains a scaffold helper to do various things, like inject mock objects into any existing actual code file for test isolation, asserting, and other useful things.

## Additional

To run an individual test use the following

    npm test -- -g "test name"

or

    npm run debugtest -- -g "test name"

where "some test name" is defined in unit test code in

    it('<TEST-NAME-HERE>', async() => { ...

or for a block of tests

    describe('<TEST-NAMES-HERE>', async() => { ...