'use strict';

var url = require('url'),
    factory = require('../drivers/factory'),
    LruCache = require('../lru'),
    crc32 = require('buffer-crc32'),
    IncludedInSegment = require('./rollout/routing_conditions/segment_based').IncludedInSegment;

function Rollout(config, cache) {
    try {
        this.initialize(config, cache);
        this.enabled = true;
    } catch (e) {
        console.warn("An error occurred while initializing the Rollout plugin." + e)
        this.enabled = false;
    }
};

Rollout.prototype.initialize = function (config, cache) {
  this.condition = new IncludedInSegment(config);

  // TODO
  this.client = cache.getDriver(config.rollout.driver);

  // LRU cache for Redis lookups
  this.lru = new LruCache();
  this.lru.enabled = config.server.lruCache;
};

Rollout.prototype.call = function(req) {
    return this.condition.call(req);
};

module.exports = Rollout;
