(function() {
    'use strict';

    var EventEmitter = require('events').EventEmitter,
        util = require('util');

    var RedisKeyedSets = function RedisKeyedSets(client) {
        this.client = client;
    };

    util.inherits(RedisKeyedSets, EventEmitter);

    RedisKeyedSets.prototype.containsOneOf = function(key, members, callback) {
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

    RedisKeyedSets.prototype.addMembersForKey = function(key, members, callback) {
        var multi = this.client.multi();

        members.forEach(function(member) {
            multi.sadd(key, member);
        });

        multi.exec(function (err, data) {
            if (err) {
                this.emit('error', new Error(JSON.stringify(err)));
            } else {
                this.emit('success', { key: key, members: members, data: data });
            }
            callback(err, data);
        }.bind(this));
    };

    RedisKeyedSets.prototype.getMembersForKey = function(key, callback) {
        this.client.smembers(key, callback);
    };

    module.exports = {
        RedisKeyedSets: RedisKeyedSets
    };
})();
