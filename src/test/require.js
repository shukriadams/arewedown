/**
 * Replaces common.js require with intermediate. Use this to intercept require() calls and insert mock modules for testing
 * purposes.
 */
let modules = {},
    virtualModules = {},
    classes = {},
    Module = require('module'),
    clonedeep = require('lodash.clonedeep'),
    originalRequire = Module.prototype.require

// do NOT make this arrow func, it will break "this" reference 
Module.prototype.require = function(){

    if (arguments.length && modules[arguments[0]]){

        const target = originalRequire.apply(this, arguments),
            clone = clonedeep(target),
            overridden = Object.assign(clone, modules[arguments[0]])

        return overridden
    }
    
    if (arguments.length && virtualModules[arguments[0]]){
        return virtualModules[arguments[0]]
    }
    
    if (arguments.length && classes[arguments[0]]){
        return classes[arguments[0]]
    }

    return originalRequire.apply(this, arguments)
}

module.exports = {
    
    add (path, mod){
        modules[path] = mod
    },

    addClass (path, cls){
        classes[path] = cls
    },
    
    virtual (path, mod){
        virtualModules[path] = mod
    },

    clear () {
        modules = {}
        virtualModules = {}
        classes = {}
    }

}
