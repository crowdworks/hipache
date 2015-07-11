(function() {
    var PathMatchesPatternInKeyedSet = require('./conditions/path_based').PathMatchesPatternInKeyedSet,
        IncludedInSegment = require('./conditions/segment_based').IncludedInSegment,
        And = require('./conditions/and').And,
        BasicPathPattern = require('./conditions/path_patterns/basic').BasicPathPattern,
        RedisKeyedSets = require('./conditions/keyed_sets/redis').RedisKeyedSets,
        redis = require('redis'),
        Injector = require('../injector').Injector,
        conditions = require('./conditions'),
        destinations = require('./destinations'),
        routes = require('./index'),
        weak = require('weak');

    var Factory = function Factory(injector, logHandler, debugHandler) {
        this.injector = injector;
        this.destructors = [];

        injector.on('created', function(created) {
            if (typeof created.end === 'function') {
                this.addDestructor(function() {
                    created.end();
                });
            }

            if (typeof created.destructor === 'function') {
                this.addDestructor(function() {
                    created.destructor();
                });
            }
        }.bind(this));

        logHandler = logHandler || console.log;
        debugHandler = debugHandler || console.log;

        this.log = function (msg) {
            logHandler('RandomBackendForHost: ' + msg);
        };
        this.debug = function (msg) {
            debugHandler('RandomBackendForHost: ' + msg);
        };
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
        injector.define('routeConditions.any', [], conditions.Any);
        injector.define('routeDestinations.randomBackendForHost', ['lru', 'driver'], destinations.RandomBackendForHost);
        injector.define('route', ['condition', 'destination'], routes.Route);
        injector.define('conditionLoader', ['factory'], conditions.Loader);
        injector.define('destinationLoader', ['factory'], destinations.Loader);

        for (var name in deps) {
            injector.register(name, deps[name]);
        }

        return Factory.fromInjector(injector);
    };

    Factory.fromInjector = function(injector) {
        return new Factory(injector);
    };

    Factory.prototype.createLru = function() {
        var LruCache = require('../lru');
        return new LruCache();
    };

    Factory.prototype.createDriver = function(driver) {
        var factory = require('../drivers/factory')
        var client = factory.getDriver(driver);

        client.on('error', function (err) {
            this.log('DriverError ' + err);
        }.bind(this));

        // TODO Do this in the injector
        this.injector.emit('created', client);

        return client
    };

    Factory.prototype.createRoute = function(options) {
        var injector = this.injector.mergeDependencies(options);
        return injector.build('route');
    };

    Factory.prototype.createDestination = function(name, options) {
        var injector = this.injector.mergeDependencies(options);
        return injector.build("routeDestinations." + name);
    };

    Factory.prototype.createRoutingCondition = function(name, options) {
        var injector = this.injector.mergeDependencies(options);
        return injector.build("routeConditions." + name);
    };

    Factory.prototype.createConditionLoader = function() {
        var injector = this.injector.mergeDependencies({ factory: weak(this) });
        return injector.build("conditionLoader");
    };

    Factory.prototype.createDestinationLoader = function() {
        var injector = this.injector.mergeDependencies({ factory: weak(this) });
        return injector.build("destinationLoader");
    };

    module.exports = Factory;
})();
