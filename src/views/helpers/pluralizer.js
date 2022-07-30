module.exports = Handlebars => {
    Handlebars.registerHelper('pluralizer', (count, word)=>{
        return `${word}${count > 1 ? 's': ''}` 
    })
}