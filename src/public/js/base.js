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
    updateInSeconds.innerHTML = `${updateSeconds}s`
}

if (dashboardRefreshInterval){
    setInterval(function(){
        showTimes()
    }, dashboardRefreshInterval)
}

showTimes()
// -------------------------------------------
const progressBars = document.querySelectorAll('[data-nextUpdate]')
const timespanString = function(end, start){
    if (typeof start === 'number' || typeof start === 'string')
        start = new Date(start)

    if (typeof end === 'number' || typeof end === 'string')
        end = new Date(end)

    let diff = end.getTime() - start.getTime()
    if (diff <= 0)
        return 'now ...'

    let days = Math.floor(diff / (1000 * 60 * 60 * 24))
    diff -=  days * (1000 * 60 * 60 * 24)

    let hours = Math.floor(diff / (1000 * 60 * 60))
    diff -= hours * (1000 * 60 * 60)

    let mins = Math.floor(diff / (1000 * 60))
    let secs = Math.floor(diff / 1000)
    function plural(value){
        return value > 1 ?'s':''
    }

    if (days >= 1)
        return `${days} day${plural(days)}`

    if (hours >= 1)
        return `${hours} hour${plural(hours)}}`
    
    if (mins >= 1)
        return `${mins} minute${plural(mins)}`
    
    return `${secs} second${plural(secs)}`
}

function initProgressBar (progressBar){
    let nextRefresh = progressBar.getAttribute('data-nextUpdate')

    const interval = setInterval(()=>{
        const nextUpdate = timespanString(nextRefresh, new Date(),  )
        progressBar.innerHTML = nextUpdate
    }, 1000)
}

for (const progressBar of progressBars)
    initProgressBar(progressBar)

// -------------------------------------------
const cbEnableReload = document.querySelector('#cbEnableReload')
    isPassing = document.querySelector('.layout.layout--failing') === null

if (cbEnableReload){
    cbEnableReload.addEventListener('change', (event) => {
        window.parent.postMessage(`reload status:${event.currentTarget.checked}`, '*')
    })
}

window.parent.postMessage(`isPassing:${isPassing}`, '*')