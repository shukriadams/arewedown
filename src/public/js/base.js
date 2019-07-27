var clientRefreshInterval = document.querySelector('body').getAttribute('data-clientRefreshInterval');

if (clientRefreshInterval){
    setTimeout(function(){
        // window.location = window.location;
    }, clientRefreshInterval);
}
