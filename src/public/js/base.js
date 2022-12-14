window.awd = window.awd  || {
    renderUpdates : true,
    fetchUpdates : true
}

let dashboardRefreshInterval = document.querySelector('#dashboardRefreshInterval') ? document.querySelector('#dashboardRefreshInterval').value : null,
    dashboardName = document.querySelector('#dashboardNode') ? document.querySelector('#dashboardNode').value : null,
    updateInSeconds = document.querySelector('.layout-updateTime'),
    progressBars = document.querySelectorAll('[data-nextUpdate]'),
    dashboardMenu = document.querySelector('.dashboardMenu'),
    restartServer = document.querySelector('.restartServer'),
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
    if (nowHolder)
        nowHolder.innerHTML = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const messageReceiver = message =>{
    if (message.data !== 'reloading')
        return

    if (dashboardMenu)
        dashboardMenu.removeEventListener('change', dashboardMenuEventHandler)

    if (restartServer)    
        restartServer.removeEventListener('click', restartServerEventHandler)

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

const fetchText=(url, options={})=>{
    return new Promise((resolve, reject)=>{
        try {
            fetch(url, options)
                .then(response => response.text())
                .then(data =>{
                    //clearTimeout(timeoutId)
                    resolve(data)
                })
                .catch(error => {
                    if (error.name === "AbortError") {
                        resolve('timeout')
                    } else {
                        reject(error)
                    }
                })
        } catch (ex) {
            reject(ex)
        }
    })
}

const restartServerEventHandler = async event => {
    if (!confirm('Are you sure you want to restart server?'))
        return

    const response = await fetchText('/restart')
    console.log('restart response: ' + response)
    if (response !== 'restarting'){
        console.log(response)
        return
    }

    let busy = false
    let timer = setInterval(async ()=>{
        if (busy)
            return

        busy = true

        try {
            // keep polling /status until we don't get an error,
            // then force reload current page
            await fetchText('/status')

            clearInterval(timer)
            window.location = window.location
        } catch (ex){
            console.log(ex)
        } finally {
            busy = false
        }
    }, 1000)
}

window.awd.update = ()=>{



    fetch(`/status/dashboard/${dashboardName}`)
        .then(response => response.json())
        .then(data => {

            // dev only
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
                        card.classList.add('watcher--up')
                        card.classList.remove('watcher--down')
                    }
                    else if (watcherdata.status === 'down'){
                        card.classList.add('watcher--down')
                        card.classList.remove('watcher--up')
                    }
                    else {
                        card.classList.remove('watcher--up')
                        card.classList.remove('watcher--down')
                    }

                } catch(ex) {
                    console.log(ex)
                }

                watcher.querySelector('.watcher-state').innerHTML = watcherdata.status
                watcher.querySelector('.watcher-timeInState').innerHTML = watcherdata.timeInState || ''
                const nextUpdateHolder = watcher.querySelector('.watcher-nextUpdate')
                if (nextUpdateHolder)
                    nextUpdateHolder.setAttribute('data-nextUpdate', watcherdata.nextRun || '')
                    
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
        .catch(error => {
            console.log(error)
        })  
}

if (dashboardRefreshInterval && dashboardName)
    setInterval(()=>{
        
        if (window.awd.fetchUpdates === false)
            return

        window.awd.update()
    }, dashboardRefreshInterval)

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

window.addEventListener('message', messageReceiver)
