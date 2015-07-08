(function() {
    var Loader = function Loader(factory) {
        this.factory = factory;
    };

    Loader.prototype.destructor = function destructor() {
        this.factory.destructor();
    };

    Loader.prototype.load = function load(config) {
        var keys = Object.keys(config);

        if (keys.length != 1) {
            throw new Error('Unexpected number of keys in: ' + JSON.stringify(config) + ': which is expected to have just one key.');
        }

        var key = keys[0];

        return this.loadRoutingCondition(key, config[key]);
    };

    Loader.prototype.loadRoutingCondition = function loadRoutingCondition(name, config) {
        var cond;
        if (name == 'and') {
            var conds = config.conditions.map(function (conf) {
                return this.load(conf);
            }.bind(this));
            cond = this.factory.createRoutingCondition(name, {andConditions: conds});
        } else if(name == 'pathMatches') {
            var deps = this.loadPathMatchingOptions(config);
            cond = this.factory.createRoutingCondition(name, deps);
        } else if(name == 'includedInSegment') {
            var deps = this.loadIncludedInSegmentOptions(config);
            cond = this.factory.createRoutingCondition(name, deps);
        } else {
            throw new Error('Unexpected type of routing condition was tried to load: ' + name);
        }

        return cond;
    };

    Loader.prototype.loadPathMatchingOptions = function loadPathMatchingOptions(config) {
        var deps = {};

        if (Object.keys(config).length > 0) {
            deps['pathMatchingOptions'] = config;
        }

        return deps;
    };

    Loader.prototype.loadIncludedInSegmentOptions = function loadIncludedInSegmentOptions(config) {
        var deps = {};

        if (Object.keys(config).length > 0) {

            deps['includedInSegmentOptions'] = config;
        }

        return deps;
    };

    module.exports = {
        Loader: Loader
    };
})();
