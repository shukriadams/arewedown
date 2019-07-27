var clientRefreshInterval = document.querySelector('body').getAttribute('data-clientRefreshInterval');

if (clientRefreshInterval){
    setTimeout(function(){
        console.log('attemping redirect')
        window.location = window.location;
    }, clientRefreshInterval);
    console.log('----');
}
