(function(){
    var clientRefreshInterval = document.querySelector('body').getAttribute('data-clientRefreshInterval'),
        frame = document.querySelector('.contentFrame');

    if (clientRefreshInterval)
        clientRefreshInterval = parseInt(clientRefreshInterval);
    
    if (clientRefreshInterval){
        setInterval(function(){
            frame.contentWindow.location = '/status'
        }, clientRefreshInterval);
    }
})()
