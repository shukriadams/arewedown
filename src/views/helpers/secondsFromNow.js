module.exports = Handlebars => {
    Handlebars.registerHelper('secondsFromNow', futureDate =>{
        if (typeof futureDate === 'string')
            futureDate = new Date(futureDate)
    
        return Math.floor((futureDate.getTime() - Date.now()) / 1000)
    })
}