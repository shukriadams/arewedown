module.exports = Handlebars => {
    Handlebars.registerHelper('date', date =>{
        const timebelt = require('timebelt')

        if (typeof date === 'string')
            date = new Date(date)

        return `${timebelt.toShortDate(date, 'y-m-d')} ${timebelt.toShortTime(date, 'h:m')}`
    })
}