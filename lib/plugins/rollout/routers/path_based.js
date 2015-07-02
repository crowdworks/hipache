(function(){
    var EventEmitter = require('events').EventEmitter,
        util = require('util');

    var PathBased = function(keyedSets, pathPattern) {
        this.keyedSets = keyedSets;
        this.pathPattern = pathPattern;
    }

    util.inherits(PathBased, EventEmitter);

    PathBased.prototype.getPatternsForPath = function(path) {
        return this.pathPattern.getPatternsForPath(path);
    }

    PathBased.prototype.namespaced = function (key) {
        return 'rollout_paths:' + key;
    };

    PathBased.prototype.enabledForHostAndPath = function(host, path, callback) {
        var key = this.namespaced(host);
        var pathPatterns = this.getPatternsForPath(path);

        this.keyedSets.containsOneOf(key, pathPatterns, callback);
    };

    PathBased.prototype.addPathPatternsForHost = function(host, pathPatterns, callback) {
        var key = this.namespaced(host);

        this.keyedSets.addMembersForKey(key, pathPatterns, callback);
    };

    PathBased.prototype.getPathPatternsForHost = function(host, callback) {
        var key = this.namespaced(host);

        this.keyedSets.getMembersForKey(key, callback);
    };

    PathBased.prototype.smokeTest = function(host, path) {
        console.log('host=' + host + ', path=' + path);
        this.enabledForHostAndPath(host, path, console.log);
    };

    module.exports = PathBased;

})();
