var dashboardRefreshInterval = document.querySelector('body').getAttribute('data-dashboardRefreshInterval'),
    updateInSeconds = document.querySelector('.layout-updateTime'),
    renderTime = null, 
    dateFields = document.querySelectorAll('[data-formatDate]'),
    nowHolder = document.querySelector('.now');
    now = new Date()

if (now && nowHolder)
    nowHolder.innerHTML = now.toLocaleTimeString()

if (dashboardRefreshInterval)
    dashboardRefreshInterval = parseInt(dashboardRefreshInterval);


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
    if (!dashboardRefreshInterval)
        return;
        
    const updateTime = new Date(renderTime.getTime() + dashboardRefreshInterval);
    const updateSeconds = Math.floor((updateTime.getTime() - new Date().getTime())/ 1000);
    updateInSeconds.innerHTML = `${updateSeconds}s`;
}

if (dashboardRefreshInterval){
    setInterval(function(){
        showTimes();
        //showUpdateTime();
    }, dashboardRefreshInterval);
}

// if no refresh time given for page, force it into non-fail mode
if (!dashboardRefreshInterval){
    document.querySelector('.layout').classList.add('layout--passing');
}


showTimes();

// -------------------------------------------
const cbEnableReload = document.querySelector('#cbEnableReload')
if (cbEnableReload){
    cbEnableReload.addEventListener('change', (event) => {
        window.parent.postMessage(`reload status:${event.currentTarget.checked}`, '*')
    })
}
