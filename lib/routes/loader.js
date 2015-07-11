'use strict';

(function() {
    var Loader = function Loader(factory, conditionLoader, destinationLoader) {
        this.factory = factory;
        this.conditionLoader = conditionLoader;
        this.destinationLoader = destinationLoader;
    };

    Loader.prototype.load = function load(config) {
        var keys = Object.keys(config);

        if (keys.length !== 2) {
            var formattedConfig = JSON.stringify(config);
            var msg = 'Unexpected number of keys in: ' + formattedConfig + ': which is expected to have just one key.';
            throw new Error(msg);
        }

        var condConf = config.condition;
        var destConf = config.destination;

        var destination = this.destinationLoader.load(destConf);
        var condition = this.conditionLoader.load(condConf);

        return this.factory.createRoute({ condition: condition, destination: destination });
    };

    module.exports = {
        Loader: Loader
    };
})();
