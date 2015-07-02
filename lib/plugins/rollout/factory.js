(function() {
    var PathBasedRouter = require('./routers/path_based'),
        Basic = require('./path_patterns/basic'),
        RedisKeyedSets = require('./keyed_sets/redis');

    var Factory = function(redisClient, pathPattern) {
        this.redisClient = redisClient;
        this.pathPattern = pathPattern;
    };

    Factory.fromOptions = function(options) {
        var redis = require('redis');
        var client = redis.createClient(options.port, options.host);

        var pathPattern = new Basic();

        return new Factory(client, pathPattern);
    };

    Factory.prototype.createRedisKeyedSets = function() {
        return new RedisKeyedSets(this.redisClient);
    }

    Factory.prototype.createPathBasedRouter = function() {
        return new PathBasedRouter(this.createRedisKeyedSets(), this.pathPattern);
    }


    module.exports = Factory;
})();
