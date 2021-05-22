module.exports = {

    /**
     * Splits a string array, all items are trimmed. removes empty.
     */
    split(string, by){
        return string.split(by)
            .filter( item=> !!item )
            .map(item => item.trim())
    }
}