(function(){
    var body = document.querySelector('body'),
        dashboardRefreshInterval = body.getAttribute('data-dashboardRefreshInterval'),
        activeFrame = document.querySelector('.contentFrame1'),
        inactiveFrame = document.querySelector('.contentFrame2');

    if (dashboardRefreshInterval)
        dashboardRefreshInterval = parseInt(dashboardRefreshInterval);
    
    function update(){

        inactiveFrame.contentWindow.location = activeFrame.contentWindow.location;
        
        // handles iframe load failure - if the frame fails to load, all active frames are 
        // hidden and the underlying fail state shows through
        var timeOut = setTimeout(function(){
            activeFrame.classList.remove('iframe--show');
            inactiveFrame.classList.remove('iframe--show');
        }, 10000); // how long we wait before giving up on page reload

        inactiveFrame.onload = function(){
            // if the frame loaded successfully, disable the failure warning
            clearTimeout(timeOut);

            // backbuffer new page to prevent reload flickering on slow devices like raspberry pi's
            setTimeout(function(){
                inactiveFrame.classList.add('iframe--show');
                activeFrame.classList.remove('iframe--show');
                inactiveFrame = activeFrame;
                activeFrame = document.querySelector('.iframe--show');
            }, 500); // time taken for a smooth load transition
        }
    }

    if (dashboardRefreshInterval){
        setInterval(update, dashboardRefreshInterval);
    }

    update();
})()
