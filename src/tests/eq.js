module.exports = function(response, job){
    // console.log(response.body);
    job.errorMessage = "eq test passed";
    return true;
}