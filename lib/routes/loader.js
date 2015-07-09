(function() {
    var Loader = function Loader(factory, conditionLoader, destinationLoader) {
        this.factory = factory;
        this.conditionLoader = conditionLoader;
        this.destinationLoader = destinationLoader;
    };

    Loader.prototype.load = function load(config) {
        var keys = Object.keys(config);

        if (keys.length != 2) {
            throw new Error('Unexpected number of keys in: ' + JSON.stringify(config) + ': which is expected to have just one key.');
        }

        var condConf = config["condition"];
        var destConf = config["destination"];

        var destination = this.destinationLoader.load(destConf);
        var condition = this.conditionLoader.load(condConf);

        return this.factory.createRoute({ condition: condition, destination: destination });
    };

    module.exports = {
        Loader: Loader
    };
})();
