module.exports = Handlebars => {
    Handlebars.registerHelper('ago', date =>{
        const ago = require('s-ago').default

        if (!date)
            return null
        
        if (typeof date === 'string')
            date = new Date(date)

        return ago(date)
    })
}