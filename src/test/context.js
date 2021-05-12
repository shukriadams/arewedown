const assert = require('madscience-node-assert')

module.exports = {

    inject : {

        /**
         * Injects an override object into the given require path.
         */
        object (requirePath, overrideObject){
            const target = require(requirePath),
                clone = clonedeep(target),
                overridden = Object.assign(clone, overrideObject)
        
            requireMock.add(requirePath, overridden)
        },


        /**
         * Injects an override function into the given require path.
         */
        function (requirePath, overrideFunction){
            requireMock.add(requirePath, overrideFunction)
        }
    },

    assert
}