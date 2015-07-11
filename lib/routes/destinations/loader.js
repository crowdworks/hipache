(function() {
    'use strict';

    var Loader = function Loader(factory) {
        this.factory = factory;
    };

    Loader.prototype.load = function load(config) {
        var keys = Object.keys(config);

        if (keys.length !== 1) {
            var formattedConfig = JSON.stringify(config);
            var msg = 'Unexpected number of keys in: ' + formattedConfig + ': which is expected to have just one key.';
            throw new Error(msg);
        }

        var key = keys[0];

        return this.loadDestination(key, config[key]);
    };

    Loader.prototype.loadDestination = function loadDestination(name, config) {
        var dest;
        if (name === 'randomBackendForHost') {
            var lru = this.factory.createLru();
            var driverConfig = (config.driver instanceof Array) ? config.driver : [config.driver];
            var driver = this.factory.createDriver(driverConfig);
            dest = this.factory.createDestination(name, {lru: lru, driver: driver, config: config});
        } else {
            throw new Error('Unexpected type of routing destination was tried to load: ' + name);
        }

        return dest;
    };

    module.exports = {
        Loader: Loader
    };
})();
