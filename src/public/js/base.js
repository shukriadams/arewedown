var clientRefreshInterval = document.querySelector('body').getAttribute('data-clientRefreshInterval');
var updateInSeconds = document.querySelector('.layout-updateTime');
var renderTime = new Date(document.querySelector('.renderTime').getAttribute('data-value'));

if (clientRefreshInterval)
    clientRefreshInterval = parseInt(clientRefreshInterval);

if (clientRefreshInterval){
    setTimeout(function(){
        window.location = window.location;
    }, clientRefreshInterval);
}

function showTimes(){
    let agos = document.querySelectorAll('.date-ago');

    for (let ago of agos){
        let date = new Date(ago.getAttribute('data-value'));
        let seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        ago.innerHTML = seconds;
    }

    let nexts = document.querySelectorAll('.date-next');

    for (let next of nexts){
        let date = new Date(next.getAttribute('data-value'));
        let seconds = Math.floor((date.getTime() - new Date().getTime()) / 1000);
        next.innerHTML = seconds;
    }    
}

function showUpdateTime(){
    const updateTime = new Date(renderTime.getTime() + clientRefreshInterval);
    const updateSeconds = Math.floor((updateTime.getTime() - new Date().getTime())/ 1000);
    updateInSeconds.innerHTML = `${updateSeconds}s`;
}

setInterval(function(){
    showTimes();
    showUpdateTime();
}, 1000);

showTimes();
showUpdateTime();

