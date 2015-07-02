(function(){
    var fs = require('fs'),
        Config = require('../../config/config'),
        cache = require('../../cache'),
        EventEmitter = require('events').EventEmitter,
        util = require('util');

    var RedisDriver = function(client) {
        this.client = client;
    }

    RedisDriver.fromRedisClient = function(redisClient) {
        return new RedisDriver(redisClient);
    }

    RedisDriver.fromConfig = function(config) {
        var redis = require('redis');
        var client = redis.createClient(config.port, config.host);
        return this.fromRedisClient(client);
    }

    util.inherits(RedisDriver, EventEmitter);

    function membersFromPath(path) {
        var parts = path.split("/");

        // membersFromPath('/public/jobs/1')
        // //=> [ '/*', '/public/*', '/public/jobs/*', '/public/jobs/1' ]
        var keys = new Array(parts.length);
        for (var i=0; i<parts.length; i++) {
            keys[i] = parts.slice(0, i+1).join("/") + (i < parts.length - 1 ? '/*' : '')
        }

        return keys;
    }

    RedisDriver.prototype.membersFromPath = membersFromPath;

    RedisDriver.prototype.namespaced = function (key) {
        return 'rollout_paths:' + key;
    };

    RedisDriver.prototype.containsOneOf = function(key, members, callback) {
        var multi = this.client.multi();

        members.forEach(function(member) {
            multi.sismember(key, member);
        }.bind(this));

        multi.exec(function (err, data) {
            if (err) {
                this.emit('error', new Error(JSON.stringify(err)));
                callback(err, null);
            } else {
                var found = false;
                for (var i=0; i<data.length; i++) {
                    if (data[i] === 1) {
                        found = true;
                        break;
                    }
                }
                this.emit('redis', { key: key, members: members, data: data });
                callback(null, found);
            }
        }.bind(this));
    };

    RedisDriver.prototype.enabledForHostAndPath = function(host, path, callback) {
        var key = this.namespaced(host);
        var members = this.membersFromPath(path);

        this.containsOneOf(key, members, callback);
    };

    RedisDriver.prototype.smokeTest = function(host, path) {
        console.log('host=' + host + ', path=' + path);
        this.enabledForHostAndPath(host, path, console.log);
    };

    module.exports = RedisDriver;

})();
