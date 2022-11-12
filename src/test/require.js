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
    
    // look in modules array, this is where most standard require module overrides are placed
    if (arguments.length && modules[arguments[0]]){

        // we requested a module that is a function, no need to process, return it as-is
        if (typeof modules[arguments[0]] === 'function')
            return modules[arguments[0]]
            
        // we requested a module that is an object. Get the original module from originalRequire, then apply the
        // queued override in modules array
        const target = originalRequire.apply(this, arguments),
            clone = clonedeep(target),
            overridden = Object.assign(clone, modules[arguments[0]])

        return overridden
    }

    // the module we require is new, return it as-is from virtualModules array, no need to apply this to originalRequire
    if (arguments.length && virtualModules[arguments[0]])
        return virtualModules[arguments[0]]
    
    // the module we require is a class
    if (arguments.length && classes[arguments[0]])
        return classes[arguments[0]]

    // give up, pass require onto originalRequire and fall back to default behaviour
    return originalRequire.apply(this, arguments)
}

module.exports = {
    
    add (path, mod){
        if (modules[path]){
            let clone = clonedeep(modules[path])
            modules[path] = Object.assign(clone, mod)
        }
        else
            modules[path] = mod
    },
    
    removeObject(path){
        if (modules[path])
            delete modules[path]
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
