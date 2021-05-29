const clonedeep = require('lodash.clonedeep'),
    assert = require('madscience-node-assert'),
    requireMock = require('./require'),
    context = {
        express : {
            req : {
                params : {},
                query : {}
            },
            res : { 
                download(){},
                end(){},
                json(){},
                status(){ },
                send(){}
            },
            getRoute(routePath){
                let route =  require(routePath),
                    routeInternals

                const expressStub = {
                    get(route, handler) { routeInternals = handler},
                    post(route, handler) { routeInternals = handler},
                    delete(route, handler) { routeInternals = handler}
                }

                // binds express to the route, this is expected on app start, so do as part of getting route
                route(expressStub)

                // stub out all page views, this is also normally done on app start with handlebarsLoader.initialize(), 
                // so we need to fake it here
                context.inject.object('madscience-handlebarsloader', {
                    getPage(){
                        // fake a compiled handlers page
                        return ()=>{ }
                    }
                })
                return routeInternals
            }
        },

        clone : clonedeep,
        
        loadHandlebarsHelper(path){
            let agoHelper = require(path),
                helperInternal
                
            agoHelper({
                    registerHelper(name, callback){ helperInternal = callback }
                }
            )

            return helperInternal
        },
        
        settings(forceSettings){
            require(_$+'lib/settings').load(forceSettings)
        },

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

module.exports = context