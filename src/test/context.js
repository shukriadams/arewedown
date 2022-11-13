const clonedeep = require('lodash.clonedeep'),
    assert = require('madscience-node-assert'),
    requireMock = require('./require'),
    context = {
        clear(){
            this.express.req.params = {}
            this.express.req.query = {}
        },
        express : {
            req : {
                params : {},
                query : {}
            },
            res : { 
                download(){},
                end(){},
                json(){},
                redirect(){},
                status(){},
                send(){}
            },

            /**
             * Captures routes in an express route handler file (/src/routes/*). We can then call route code directly from tests.
             * routeModulePath : string : Required. path of the routeModule in /src/routes
             * expectedRouteString : string. Optional. If a route has multiple http method handlers, set this to limit cature to 
             *                       specific handlers
             */
            captureRoutes(routeModulePath, expectedRouteString){
                let routeModule = require(routeModulePath),
                    routeCaller,
                    fakeExpress = {
                        // capture expressCallback for http methods

                        get(routeString, expressCallback) { 
                            if (!expectedRouteString || expectedRouteString === routeString)
                                routeCaller = expressCallback 
                        },
                        post(routeString, expressCallback) { 
                            if (!expectedRouteString || expectedRouteString === routeString)
                                routeCaller = expressCallback 
                        },
                        delete(routeString, expressCallback) { 
                            if (!expectedRouteString || expectedRouteString === routeString)
                                routeCaller = expressCallback 
                        }
                    }

                // inject out fake express into the route handler, this is expected on app start, so do as part of getting route.
                // In this way the route will be handled by our fakeExpress instead of real express, and fakeexpress in turn calls
                // our test code against the route
                routeModule(fakeExpress)

                // stub out all page views, this is also normally done on app start with handlebarsLoader.initialize(), 
                // so we need to fake it here
                context.inject.object('madscience-handlebarsloader', {
                    getPage(){
                        // fake a compiled handlers page
                        return ()=>{ }
                    }
                })

                // stub out logs, we never want to test logging from routes
                context.inject.object('./../lib/logger', {
                    instance:()=> { 
                        return {
                            error(){},
                            warning(){},
                            info(){},
                            debug(){}
                        }
                    },
                    instanceWatcher:()=> { 
                        return this.instance()
                    }
                })

                return routeCaller
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
             * creates a new module
             */
            virtual(path, override){
                requireMock.virtual(path, override)
            },

            /**
             * merges an object
             */
            object(path, override){
                requireMock.add(path, override)
            },

            removeObject(path){
                requireMock.removeObject(path)
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