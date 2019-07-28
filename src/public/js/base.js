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
    let dateTime = document.querySelectorAll('.date-time');
    for (let item of dateTime){
        let date = new Date(item.getAttribute('data-value'));
        let seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
        item.innerHTML = `${seconds}s ago`;
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

