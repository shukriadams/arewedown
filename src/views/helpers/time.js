module.exports = Handlebars => {
    Handlebars.registerHelper('time', date =>{
        if (typeof date === 'string')
            date = new Date(date)

        return date.toLocaleTimeString()
    })
}