(function() {
    var PathMatchesPatternInKeyedSet = require('./routing_conditions/path_based').PathMatchesPatternInKeyedSet,
        IncludedInSegment = require('./routing_conditions/segment_based').IncludedInSegment,
        BasicPathPattern = require('./path_patterns/basic').BasicPathPattern,
        RedisKeyedSets = require('./keyed_sets/redis').RedisKeyedSets,
        redis = require('redis'),
        Injector = require('../../injector').Injector;

    var Factory = function Factory(injector) {
        this.injector = injector;
    };

    Factory.fromDependencies = function(deps) {
        var injector = new Injector();

        injector.define('keyedSets', [ 'redisClient' ], RedisKeyedSets);
        injector.define('redisClient', [ 'redisOptions' ], function(opts) { var client = redis.createClient(opts.port, opts.host); return client;  }, 'func');
        injector.define('pathPattern', [], BasicPathPattern);
        injector.define('routeConditions.pathMatches', ['keyedSets', 'pathPattern', 'pathMatchingOptions'], PathMatchesPatternInKeyedSet);
        injector.define('routeConditions.includedInSegment', ['includedInSegmentOptions'], IncludedInSegment);

        for (var name in deps) {
            injector.register(name, deps[name]);
        }

        return Factory.fromInjector(injector);
    };

    Factory.fromInjector = function(injector) {
        return new Factory(injector);
    };

    Factory.prototype.createRoutingCondition = function(name, options) {
        return this.injector.create("routeConditions." + name);
    };

    module.exports = Factory;
})();
