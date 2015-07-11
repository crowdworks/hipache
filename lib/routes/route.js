(function() {
    var Route = function Route(condition, destination) {
        this.condition = condition;
        this.destination = destination;
    };

    Route.prototype.markDeadBackend = function (meta) {
        return this.destination.markDeadBackend(meta);
    };

    Route.prototype.enabledForRequest = function (req, callback) {
        return this.condition.call(req, callback);
    };

    Route.prototype.getBackendFromRequest = function (req, callback) {
        return this.destination.getBackendFromRequest(req, callback);
    };

    module.exports = {
        Route: Route
    };
})();
