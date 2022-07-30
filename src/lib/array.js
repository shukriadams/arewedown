module.exports = {

    /**
     * Splits a string array, all items are trimmed. removes empty.
     */
    split(string, by){
        return string.split(by)
            .filter( item=> !!item )
            .map(item => item.trim())
    },

    /**
     * 
     */
    toPage (items, index, pageSize){
        let pages = Math.floor(items.length / pageSize),
            totalItems = items.length
    
        if (items.length % pageSize)
            pages ++
    
        items = items.slice(index * pageSize, (index * pageSize) + pageSize)
    
        return { items, pages, index, totalItems }
    }
}