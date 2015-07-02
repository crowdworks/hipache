(function() {
    var PathMatchesPatternInKeyedSet = require('./routing_conditions/path_based').PathMatchesPatternInKeyedSet,
        BasicPathPattern = require('./path_patterns/basic').BasicPathPattern,
        RedisKeyedSets = require('./keyed_sets/redis').RedisKeyedSets,
        redis = require('redis');


    var Factory = function Factory(redisClient, pathPattern, options) {
        this.redisClient = redisClient;
        this.pathPattern = pathPattern;
        this.options = options;
    };

    Factory.fromOptions = function(options) {
        var client = redis.createClient(options.port, options.host);

        var pathPattern = new BasicPathPattern();

        return new Factory(client, pathPattern, options);
    };

    Factory.prototype.createRedisKeyedSets = function() {
        return new RedisKeyedSets(this.redisClient);
    };

    Factory.prototype.createPathMatchesPatternInKeyedSet = function() {
        return new PathMatchesPatternInKeyedSet(this.createRedisKeyedSets(), this.pathPattern, this.options);
    };

    module.exports = Factory;
})();
