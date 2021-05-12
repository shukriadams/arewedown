module.exports = {
    split: function(string, by){
        let array = string.split(by)
        array = array.filter((item)=>{ return item.length? item: null })
        array = array.map((item)=>{return item.trim()})
        return array
    }
}