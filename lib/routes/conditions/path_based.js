(function(){
    'use strict';

    var EventEmitter = require('events').EventEmitter,
        util = require('util'),
        utils = require('../../utils');

    var PathMatchesPatternInKeyedSet = utils.callable(
        function(keyedSets, pathPattern, options) {
            this.keyedSets = keyedSets;
            this.pathPattern = pathPattern;
            this.options = options;
        }
    );

    util.inherits(PathMatchesPatternInKeyedSet, EventEmitter);

    PathMatchesPatternInKeyedSet.prototype.getPatternsForPath = function(path) {
        return this.pathPattern.getPatternsForPath(path);
    };

    PathMatchesPatternInKeyedSet.prototype.namespaced = function (key) {
        return this.options.prefix + key;
    };

    PathMatchesPatternInKeyedSet.prototype.enabledForHostAndPath = function(host, path, callback) {
        var key = this.namespaced(host);
        var pathPatterns = this.getPatternsForPath(path);

        this.keyedSets.containsOneOf(key, pathPatterns, callback);
    };

    PathMatchesPatternInKeyedSet.prototype.addPathPatternsForHost = function(host, pathPatterns, callback) {
        var key = this.namespaced(host);

        this.keyedSets.addMembersForKey(key, pathPatterns, callback);
    };

    PathMatchesPatternInKeyedSet.prototype.getPathPatternsForHost = function(host, callback) {
        var key = this.namespaced(host);

        this.keyedSets.getMembersForKey(key, callback);
    };

    PathMatchesPatternInKeyedSet.prototype.smokeTest = function(host, path) {
        console.log('host=' + host + ', path=' + path);
        this.enabledForHostAndPath(host, path, console.log);
    };

    PathMatchesPatternInKeyedSet.prototype.call = function(req, callback) {
        return this.enabledForHostAndPath(req.headers.host, req.path, callback);
    };

    module.exports = {
        PathMatchesPatternInKeyedSet: PathMatchesPatternInKeyedSet
    };

})();
