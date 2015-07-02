(function() {
    var PathBasedRoute = require('./routes/path_based').PathBasedRoute,
        BasicPathPattern = require('./path_patterns/basic').BasicPathPattern,
        RedisKeyedSets = require('./keyed_sets/redis').RedisKeyedSets;

    var Factory = function Factory(redisClient, pathPattern) {
        this.redisClient = redisClient;
        this.pathPattern = pathPattern;
    };

    Factory.fromOptions = function(options) {
        var redis = require('redis');
        var client = redis.createClient(options.port, options.host);

        var pathPattern = new BasicPathPattern();

        return new Factory(client, pathPattern);
    };

    Factory.prototype.createRedisKeyedSets = function() {
        return new RedisKeyedSets(this.redisClient);
    };

    Factory.prototype.createPathBasedRouter = function() {
        return new PathBasedRoute(this.createRedisKeyedSets(), this.pathPattern);
    };

    module.exports = Factory;
})();
