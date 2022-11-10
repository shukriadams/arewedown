# AreWeDown? Live Tests

These are tests for a live instance of AWD. For unit tests, see /src/test

## How to use

- Build project and mount as container, or start dev project in another window - server should listen at http://localhost:3000
- To test a server running at a different address use

        export TEST_URL=<YOUR-SERVER-URL>

- Setup test project with
    
        cd <thisdir>
        npm install

- Run these tests in this directory with 

        cd <thisdir>
        npm test


