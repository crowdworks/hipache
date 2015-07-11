
'use strict';

/*
 * This module handles all IO called on the cache (currently Redis)
 */

var url = require('url'),
    factory = require('./drivers/factory'),
    LruCache = require('./lru'),
    RoutesFactory = require('./routes/factory'),
    when = require('when'),
    callbacks = require('when/callbacks'),
    bindCallback = require('when/node').bindCallback;

function Router(config, handlers) {
    if (!(this instanceof Router)) {
        return new Router(config, handlers);
    }

    var logHandler = handlers.logHandler || console.log,
        debugHandler = handlers.debugHandler || console.log;
    this.config = config;

    this.log = function (msg) {
        logHandler('Cache: ' + msg);
    };
    this.debug = function (msg) {
        debugHandler('Cache: ' + msg);
    };

    var routesFactory = RoutesFactory.fromDependencies({});

    var client = routesFactory.createDriver(config.driver);

    // LRU cache for Redis lookups
    var lru = new LruCache();
    lru.enabled = config.server.lruCache;

    var condition = routesFactory.createRoutingCondition('any', {});
    var destination = routesFactory.createDestination('randomBackendForHost', { lru: lru, driver: client, options: config.server });
    var route = routesFactory.createRoute({condition: condition, destination: destination});

    this.routes = [
        route
    ];
}

Router.prototype.markDeadBackend = function (meta) {
    // TODO For efficiency, keep the route used for the request and markDeadBackend only for that route.
    for (var i=0; i<this.routes.length; i++) {
        this.routes[i].markDeadBackend(meta);
    }
};

Router.prototype.allEnabledForRequest = function(req, callback) {
    return bindCallback(
        when.all(
            this.routes.map(function(route) {
                var boundCallback;
                boundCallback = route.enabledForRequest.bind(route);

                return callbacks.call(boundCallback, req);
            })
        ).then(function(results) {
            return results;
        }),
        callback
    );
};

Router.prototype.getBackendFromRequest = function (req, callback) {
    var routes = this.routes;

    this.allEnabledForRequest(req, function(err, results) {
        for (var i = 0; i < routes.length; i++) {
            var route = routes[i];
            var error = results[i][0]
            var enabled = results[i][1];
            if (enabled) {
                return route.getBackendFromRequest(req, callback);
            }
        }

        throw new Error('No route defined for this request');
    });
};

module.exports = Router;
