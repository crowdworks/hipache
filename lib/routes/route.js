(function() {
    var Route = function Route(condition, destination) {
        this.condition = condition;
        this.destination = destination;
    };

    module.exports = {
        Route: Route
    };
})();
