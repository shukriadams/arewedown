(()=>{

    let body = document.querySelector('body'),
        dashboardRefreshInterval = body.getAttribute('data-dashboardRefreshInterval'),
        dashboardLoadTimeout = body.getAttribute('data-dashboardLoadTimeout'),
        dashboard = body.getAttribute('data-dashboard'),
        activeFrame = document.querySelector('.contentFrame1'),
        inactiveFrame = document.querySelector('.contentFrame2'),
        reload = true

    if (dashboardRefreshInterval)
        dashboardRefreshInterval = parseInt(dashboardRefreshInterval)
    
    window.addEventListener('message', message => {
        if (message.data.startsWith('reload status:'))
            reload = message.data.replace('reload status:', '') === 'true'

        if (message.data.startsWith('isPassing:'))
            isPassing = message.data === 'isPassing:true' 

        if (message.data.startsWith('dashboard:')){
            dashboard = message.data.replace('dashboard:', '')
            window.location = `${window.location.pathname}?dashboard=${encodeURI(dashboard)}`

            update()
        }
        
        if (message.data === 'reload'){
            console.log('force reloading....')
            update()
        }

        document.title = `${isPassing ? `` : 'ERRORS! ' }Are We Down?` 
    })

    function update(){
        if (!reload)
            return

        inactiveFrame.contentWindow.location = `/dashboard/${dashboard}`
        
        // handles iframe load failure - if the frame fails to load, all active frames are 
        // hidden and the underlying fail state shows through
        var timeOut = setTimeout(() =>{
            if (!reload)
                return

            activeFrame.classList.remove('iframe--show')
            inactiveFrame.classList.remove('iframe--show')
        }, dashboardLoadTimeout) // how long we wait before giving up on page reload

        inactiveFrame.onload = () => {

            // if the frame loaded successfully, disable the failure warning
            clearTimeout(timeOut)

            // warn child frames reload is imminent
            window.parent.postMessage(`reloading`, '*')

            // backbuffer new page to prevent reload flickering on slow devices like raspberry pi's
            setTimeout(()=>{
                if (!reload)
                    return
    

                inactiveFrame.classList.add('iframe--show')
                activeFrame.classList.remove('iframe--show')
                inactiveFrame = activeFrame
                activeFrame = document.querySelector('.iframe--show')
            }, 500) // time taken for a smooth load transition
        }
    }
    
    if (dashboardRefreshInterval)
        setInterval(update, dashboardRefreshInterval)
    
    update()    

})()
