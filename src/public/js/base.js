window.awd = window.awd  || {
    renderUpdates : true,
    fetchUpdates : true
}

let dashboardRefreshInterval = document.querySelector('body').getAttribute('data-dashboardRefreshInterval'),
    dashboardName = document.querySelector('#dashboardNode').value,
    updateInSeconds = document.querySelector('.layout-updateTime'),
    progressBars = document.querySelectorAll('[data-nextUpdate]'),
    dashboardMenu = document.querySelector('.dashboardMenu'),
    restartServer = document.querySelector('.restartServer'),
    rerunAllWatchers = document.querySelector('.rerunAllWatchers'),
    renderTime = null, 
    dateFields = document.querySelectorAll('[data-formatDate]'),
    nowHolder = document.querySelector('.now')

if (dashboardRefreshInterval)
    dashboardRefreshInterval = parseInt(dashboardRefreshInterval)

for (let i = 0 ; i < dateFields.length ; i ++) {
    let dateField = dateFields[i],
        date = new Date(dateField.getAttribute('data-formatDate')),
        formatted = date.toLocaleTimeString()

    dateField.innerHTML = formatted
}

function updateRenderTime(){
    nowHolder.innerHTML = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const messageReceiver = message =>{
    if (message.data !== 'reloading')
        return

    if (dashboardMenu)
        dashboardMenu.removeEventListener('change', dashboardMenuEventHandler)

    if (restartServer)    
        restartServer.removeEventListener('click', restartServerEventHandler)

    if (rerunAllWatchers)
        rerunAllWatchers.removeEventListener('click', rerunAllWatchersHandler)

    window.removeEventListener('message', messageReceiver)
}   


const dashboardMenuEventHandler = event => {
    if (!dashboardMenu.value){
        // force set existing value
        const dashboardNode = document.querySelector('#dashboardNode')
        dashboardMenu.value = dashboardNode.value
        return
    }

    window.location = `/dashboard/${dashboardMenu.value}`
}

const restartServerEventHandler = event => {
    fetch('/restart')
        .then(response => response.text())
        .then(data => console.log(data))
}

setInterval(()=>{
    if (window.awd.fetchUpdates === false)
        return

    fetch(`/status/dashboard/${dashboardName}`)
        .then(response => response.json())
        .then(data => {
            if (window.awd.renderUpdates === false)
                return
    
            let allWatchers = []

            for(let watcherdata of data.watchers){
                const watcher = document.querySelector(`[data-watcher="${watcherdata.name}"]`),
                    card = watcher.querySelector('.watcher')

                allWatchers.push({
                    element : watcher,
                    watcherdata
                })

                try {


                    if (watcherdata.status === 'up'){
                        card.classList.add('watcher--passing')
                        card.classList.remove('watcher--failing')
                    }
                    else if (watcherdata.status === 'down'){
                        card.classList.add('watcher--failing')
                        card.classList.remove('watcher--passing')
                    }
                    else {
                        card.classList.remove('watcher--passing')
                        card.classList.remove('watcher--failing')
                    }

                } catch(ex) {
                    console.log(ex)
                }

                watcher.querySelector('.watcher-state').innerHTML = watcherdata.status
                watcher.querySelector('.watcher-timeInState').innerHTML = watcherdata.timeInState || ''
                watcher.querySelector('.watcher-nextUpdate').setAttribute('data-nextUpdate', watcherdata.nextRun || '') 
                watcher.querySelector('.watcher-errorMessage').innerHTML = watcherdata.errorMessage
            }

            let previousSibling = null
            for (let i = 0; i < allWatchers.length; i ++){
                let thisnode = allWatchers[allWatchers.length - 1 - i].element
                thisnode.parentNode.insertBefore(thisnode, previousSibling)
                previousSibling = thisnode
            }

            const layout = document.querySelector('.layout')
            if (data.hasFailing)
                layout.classList.add('layout--failing')
            else
                layout.classList.remove('layout--failing')

            updateRenderTime()
        })  
}, 5000)

const rerunAllWatchersHandler = event => {
    let targetDashboard = dashboardMenu ? dashboardMenu.value : '*'
    fetch(`/rerun/dashboard/${encodeURI(targetDashboard)}`)
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
updateRenderTime()
// -------------------------------------------
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

setInterval(()=>{
    for(let countDown of document.querySelectorAll('.watcher-nextUpdate')){
        let nextRefresh = countDown.getAttribute('data-nextUpdate')
        countDown.innerHTML = nextRefresh ? timespanString(nextRefresh, new Date()) : ''
    }
}, 1000)

// -------------------------------------------

if (dashboardMenu)
    dashboardMenu.addEventListener('change', dashboardMenuEventHandler)

if (restartServer)    
    restartServer.addEventListener('click', restartServerEventHandler)

if (rerunAllWatchers)
    rerunAllWatchers.addEventListener('click', rerunAllWatchersHandler)

window.addEventListener('message', messageReceiver)
