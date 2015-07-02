(function(){
    var EventEmitter = require('events').EventEmitter,
        util = require('util');

    var PathBasedRoute = function PathBasedRoute(keyedSets, pathPattern) {
        this.keyedSets = keyedSets;
        this.pathPattern = pathPattern;
    }

    util.inherits(PathBasedRoute, EventEmitter);

    PathBasedRoute.prototype.getPatternsForPath = function(path) {
        return this.pathPattern.getPatternsForPath(path);
    }

    PathBasedRoute.prototype.namespaced = function (key) {
        return 'rollout_paths:' + key;
    };

    PathBasedRoute.prototype.enabledForHostAndPath = function(host, path, callback) {
        var key = this.namespaced(host);
        var pathPatterns = this.getPatternsForPath(path);

        this.keyedSets.containsOneOf(key, pathPatterns, callback);
    };

    PathBasedRoute.prototype.addPathPatternsForHost = function(host, pathPatterns, callback) {
        var key = this.namespaced(host);

        this.keyedSets.addMembersForKey(key, pathPatterns, callback);
    };

    PathBasedRoute.prototype.getPathPatternsForHost = function(host, callback) {
        var key = this.namespaced(host);

        this.keyedSets.getMembersForKey(key, callback);
    };

    PathBasedRoute.prototype.smokeTest = function(host, path) {
        console.log('host=' + host + ', path=' + path);
        this.enabledForHostAndPath(host, path, console.log);
    };

    module.exports = {
        PathBasedRoute: PathBasedRoute
    };

})();
