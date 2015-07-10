
'use strict';

/*
 * This module handles all IO called on the cache (currently Redis)
 */

var url = require('url'),
    factory = require('./drivers/factory'),
    LruCache = require('./lru'),
    RoutesFactory = require('./routes/factory');

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

    this.client = routesFactory.createDriver(config.driver);

    // LRU cache for Redis lookups
    this.lru = new LruCache();
    this.lru.enabled = config.server.lruCache;

    this.destination = routesFactory.createDestination('randomBackendForHost', { lru: this.lru, driver: this.client, options: config.server });
}

Router.prototype.markDeadBackend = function (meta) {
    return this.destination.markDeadBackend(meta);
};

Router.prototype.getBackendFromRequest = function (req, callback) {
    return this.destination.getBackendFromRequest(req, callback);
};




module.exports = Router;
