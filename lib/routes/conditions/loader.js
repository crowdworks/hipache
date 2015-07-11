(function() {
    'use strict';

    var Loader = function Loader(factory) {
        this.factory = factory;
    };

    Loader.prototype.load = function load(config) {
        var keys = Object.keys(config);

        if (keys.length !== 1) {
            var formattedConfig = JSON.stringify(config);
            var msg = 'Unexpected number of keys in: ' + formattedConfig + ': which is expected to have just one key.';
            throw new Error(msg);
        }

        var key = keys[0];

        return this.loadRoutingCondition(key, config[key]);
    };

    Loader.prototype.loadRoutingCondition = function loadRoutingCondition(name, config) {
        var cond;

        if (name === 'and') {
            var conds = config.conditions.map(function (conf) {
                return this.load(conf);
            }.bind(this));
            cond = this.factory.createRoutingCondition(name, {andConditions: conds});
        } else if(name === 'pathMatches') {
            var pathMatchingOpts = this.loadPathMatchingOptions(config);
            cond = this.factory.createRoutingCondition(name, pathMatchingOpts);
        } else if(name === 'includedInSegment') {
            var includedInSegmentOpts = this.loadIncludedInSegmentOptions(config);
            cond = this.factory.createRoutingCondition(name, includedInSegmentOpts);
        } else {
            throw new Error('Unexpected type of routing condition was tried to load: ' + name);
        }

        return cond;
    };

    Loader.prototype.loadPathMatchingOptions = function loadPathMatchingOptions(config) {
        var deps;

        if (Object.keys(config).length > 0) {
            deps = { pathMatchingOptions: config };
        } else {
            deps = {};
        }

        return deps;
    };

    Loader.prototype.loadIncludedInSegmentOptions = function loadIncludedInSegmentOptions(config) {
        var deps;

        if (Object.keys(config).length > 0) {
            deps = { includedInSegmentOptions: config };
        } else {
            deps = {};
        }

        return deps;
    };

    module.exports = {
        Loader: Loader
    };
})();
