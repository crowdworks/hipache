'use strict';

var LruCache = require('../lru'),
    IncludedInSegment = require('../routes/conditions/segment_based').IncludedInSegment;

function Rollout(config, cache) {
    try {
        this.initialize(config, cache);
        this.enabled = true;
    } catch (e) {
        console.warn("An error occurred while initializing the Rollout plugin." + e, e.stack.split("\n"));
        this.enabled = false;
    }
}

Rollout.prototype.initialize = function (config, cache) {
    if (typeof config.rollout === 'undefined') {
        throw new Error("Missing rollout configuration in", config);
    }

  this.condition = new IncludedInSegment(config.rollout);

  // TODO
  this.client = cache.getDriver(config.driver);

  // LRU cache for Redis lookups
  this.lru = new LruCache();
  this.lru.enabled = config.server.lruCache;
};

Rollout.prototype.call = function(req, callback) {
    if (this.enabled) {
        return this.condition.call(req, callback);
    } else {
        return callback(null, false);
    }
};

module.exports = Rollout;
