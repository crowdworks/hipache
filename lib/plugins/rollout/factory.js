(function() {
    var PathMatchesPatternInKeyedSet = require('./routing_conditions/path_based').PathMatchesPatternInKeyedSet,
        IncludedInSegment = require('./routing_conditions/segment_based').IncludedInSegment,
        And = require('./routing_conditions/and').And,
        BasicPathPattern = require('./path_patterns/basic').BasicPathPattern,
        RedisKeyedSets = require('./keyed_sets/redis').RedisKeyedSets,
        redis = require('redis'),
        Injector = require('../../injector').Injector;

    var Factory = function Factory(injector) {
        this.injector = injector;
        this.destructors = [];

        injector.on('created', function(created) {
            if (typeof created.end === 'function') {
                this.addDestructor(function() {
                    created.end();
                });
            }
        }.bind(this));
    };

    Factory.prototype.destructor = function() {
        this.destructors.forEach(function (destructor) {
            destructor();
        });
    };

    Factory.prototype.addDestructor = function(destructor) {
        this.destructors.push(destructor);
    };

    Factory.fromDependencies = function(deps) {
        var injector = new Injector();

        injector.define('keyedSets', [ 'redisClient' ], RedisKeyedSets);
        injector.define('redisClient', [ 'redisOptions' ], function(opts) {
            var client = redis.createClient(opts.port, opts.host);
            return client;
        }.bind(this), 'func');
        injector.define('pathPattern', [], BasicPathPattern);
        injector.define('routeConditions.pathMatches', ['keyedSets', 'pathPattern', 'pathMatchingOptions'], PathMatchesPatternInKeyedSet);
        injector.define('routeConditions.includedInSegment', ['includedInSegmentOptions'], IncludedInSegment);
        injector.define('routeConditions.and', ['andConditions'], And);

        for (var name in deps) {
            injector.register(name, deps[name]);
        }

        return Factory.fromInjector(injector);
    };

    Factory.fromInjector = function(injector) {
        return new Factory(injector);
    };

    Factory.prototype.createRoutingCondition = function(name, options) {
        var injector = this.injector.mergeDependencies(options);
        return injector.build("routeConditions." + name);
    };

    module.exports = Factory;
})();
