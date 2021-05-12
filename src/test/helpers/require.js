/**
 * Replaces common.js require with intermediate. Use this to intercept require() calls and insert mock modules for testing
 * purposes.
 */
let modules = {},
    Module = require('module'),
    originalRequire = Module.prototype.require

// do NOT make this arrow func, it will break "this" reference 
Module.prototype.require = function(){

    if (arguments.length && modules[arguments[0]])
        return modules[arguments[0]]
   
    return originalRequire.apply(this, arguments)
}

module.exports = {
    
    add : (path, mod)=>{
        modules[path] = mod
    },
    
    clear : ()=>{
        modules = {}
    }

}

