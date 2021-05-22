const clonedeep = require('lodash.clonedeep'),
    assert = require('madscience-node-assert'),
    requireMock = require('./require')

const injectObject = (path, override)=>{
    requireMock.add(path, override)
}

const injectClass = (path, override)=>{
    const target = require(path),
        clone = Object.assign(Object.create(Object.getPrototypeOf(target)), target)

    requireMock.add(path, clone)
}



module.exports = {
    clone : clonedeep,
    inject : {
        
        /**
         * Overwrites an object
         */
        virtual(path, override){
            requireMock.virtual(path, override)
        },

        /**
         * Overwrites an object
         */
        object(path, override){
            requireMock.add(path, override)
        },

        removeObject(path){
            requireMock.removeObject(path)
        },

        overwriteObject(path, obj){
            requireMock.overwriteObject(path, obj)
        },

        class(path, cls){
            requireMock.addClass(path, cls)
        },

        /**
         * Overwrites a function
         */
        function : (path, override)=>{
            requireMock.add(path, override)
        }
    },

    requireMock,

    assert
}