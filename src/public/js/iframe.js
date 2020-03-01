(function(){
    var dashboardRefreshInterval = document.querySelector('body').getAttribute('data-dashboardRefreshInterval'),
        activeFrame = document.querySelector('.contentFrame1'),
        inactiveFrame = document.querySelector('.contentFrame2');

    if (dashboardRefreshInterval)
        dashboardRefreshInterval = parseInt(dashboardRefreshInterval);
    
    function update(){
        inactiveFrame.contentWindow.location = '/status'

        var timeOut = setTimeout(function(){
            activeFrame.classList.remove('iframe--show');
            inactiveFrame.classList.remove('iframe--show');

        }, 10000)

        inactiveFrame.onload = function(){
            clearTimeout(timeOut);
            setTimeout(function(){
                inactiveFrame.classList.add('iframe--show');
                activeFrame.classList.remove('iframe--show');
                inactiveFrame = activeFrame;
                activeFrame = document.querySelector('.iframe--show');
            }, 500);
        }
    }

    if (dashboardRefreshInterval){
        setInterval(update, dashboardRefreshInterval);
    }

    update();
})()
