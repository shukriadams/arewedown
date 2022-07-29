let dashboardRefreshInterval = document.querySelector('body').getAttribute('data-dashboardRefreshInterval'),
    updateInSeconds = document.querySelector('.layout-updateTime'),
    dashboardMenu = document.querySelector('.dashboardMenu'),
    restartServer = document.querySelector('.restartServer'),
    rerunAllWatchers = document.querySelector('.rerunAllWatchers'),
    renderTime = null, 
    cbEnableReload = document.querySelector('#cbEnableReload')
    dateFields = document.querySelectorAll('[data-formatDate]'),
    nowHolder = document.querySelector('.now'),
    isPassing = document.querySelector('.layout.layout--failing') === null,
    now = new Date()

if (now && nowHolder)
    nowHolder.innerHTML = now.toLocaleTimeString()

if (dashboardRefreshInterval)
    dashboardRefreshInterval = parseInt(dashboardRefreshInterval)

for (let i = 0 ; i < dateFields.length ; i ++) {
    let dateField = dateFields[i],
        date = new Date(dateField.getAttribute('data-formatDate')),
        formatted = date.toLocaleTimeString()

    dateField.innerHTML = formatted
}

const messageReceiver = message =>{
    if (message.data !== 'reloading')
        return

    if (cbEnableReload)
        cbEnableReload.removeEventListener('change', cbEnableReloadEventHandler)

    if (dashboardMenu)
        dashboardMenu.removeEventListener('change', dashboardMenuEventHandler)

    if (restartServer)    
        restartServer.removeEventListener('click', restartServerEventHandler)

    if (rerunAllWatchers)
        rerunAllWatchers.removeEventListener('click', rerunAllWatchersHandler)

    window.removeEventListener('message', messageReceiver)
}   

const cbEnableReloadEventHandler = event => {
    window.parent.postMessage(`reload status:${event.currentTarget.checked}`, '*')
}

const dashboardMenuEventHandler = event => {
    window.parent.postMessage(`dashboard:${dashboardMenu.value}`, '*')
}

const restartServerEventHandler = event => {
    fetch('/restart')
        .then(response => response.text())
        .then(data => console.log(data))
}

const rerunAllWatchersHandler = event => {
    let targetDashboard = dashboardMenu ? dashboardMenu.value : '*'
    fetch(`/rerun/dashboard/${encodeURI(targetDashboard)}`)
        .then(response => response.text())
        .then(data =>{ 
            alert(data)
            window.parent.postMessage(`reload`, '*')
        })
}

function showTimes(){
    let agos = document.querySelectorAll('.date-ago'),
        now = new Date()

    for (let ago of agos){
        let date = new Date(ago.getAttribute('data-value')),
            seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

        if (seconds < 0) 
            seconds = 0

        ago.innerHTML = seconds
    }

    let nexts = document.querySelectorAll('.date-next')

    for (let next of nexts){
        let date = new Date(next.getAttribute('data-value')),
            seconds = Math.floor((date.getTime() - now.getTime()) / 1000)

        if (seconds < 0) 
            seconds = 0

        next.innerHTML = seconds
    }    
}

function showUpdateTime(){
    if (!dashboardRefreshInterval)
        return
        
    const updateTime = new Date(renderTime.getTime() + dashboardRefreshInterval),
        updateSeconds = Math.floor((updateTime.getTime() - new Date().getTime())/ 1000)

    updateInSeconds.innerHTML = `${updateSeconds}s`
}

if (dashboardRefreshInterval){
    setInterval(()=>{
        showTimes()
    }, dashboardRefreshInterval)
}

showTimes()
// -------------------------------------------
const progressBars = document.querySelectorAll('[data-nextUpdate]')
const timespanString = (end, start)=>{
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

    setInterval(()=>{
        progressBar.innerHTML = timespanString(nextRefresh, new Date())
    }, 1000)
}

for (const progressBar of progressBars)
    initProgressBar(progressBar)

// -------------------------------------------

if (cbEnableReload)
    cbEnableReload.addEventListener('change', cbEnableReloadEventHandler)

if (dashboardMenu)
    dashboardMenu.addEventListener('change', dashboardMenuEventHandler)

if (restartServer)    
    restartServer.addEventListener('click', restartServerEventHandler)

if (rerunAllWatchers)
    rerunAllWatchers.addEventListener('click', rerunAllWatchersHandler)

window.addEventListener('message', messageReceiver)
window.parent.postMessage(`isPassing:${isPassing}`, '*')