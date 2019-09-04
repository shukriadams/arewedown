var clientRefreshInterval = document.querySelector('body').getAttribute('data-clientRefreshInterval');
var updateInSeconds = document.querySelector('.layout-updateTime');
var renderTime = null; //new Date(document.querySelector('.renderTime').getAttribute('data-value'));
var dateFields = document.querySelectorAll('[data-formatDate]');

var nowHolder = document.querySelector('.now');
var now = new Date();
nowHolder.innerHTML = now.toLocaleTimeString();

if (clientRefreshInterval)
    clientRefreshInterval = parseInt(clientRefreshInterval);


for (var i = 0 ; i < dateFields.length ; i ++)
{
    let dateField = dateFields[i];
    let date = new Date(dateField.getAttribute('data-formatDate'));
    let formatted = date.toLocaleTimeString();
    dateField.innerHTML = formatted;
}

function showTimes(){
    let agos = document.querySelectorAll('.date-ago');
    var now = new Date();

    for (let ago of agos){
        let date = new Date(ago.getAttribute('data-value'));
        let seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (seconds < 0) 
            seconds = 0;

        ago.innerHTML = seconds;
    }

    let nexts = document.querySelectorAll('.date-next');

    for (let next of nexts){
        let date = new Date(next.getAttribute('data-value'));
        let seconds = Math.floor((date.getTime() - now.getTime()) / 1000);

        if (seconds < 0) 
            seconds = 0;

        next.innerHTML = seconds;
    }    
}

function showUpdateTime(){
    if (!clientRefreshInterval)
        return;
        
    const updateTime = new Date(renderTime.getTime() + clientRefreshInterval);
    const updateSeconds = Math.floor((updateTime.getTime() - new Date().getTime())/ 1000);
    updateInSeconds.innerHTML = `${updateSeconds}s`;
}

setInterval(function(){
    showTimes();
    //showUpdateTime();
}, 1000);

showTimes();
//showUpdateTime();

