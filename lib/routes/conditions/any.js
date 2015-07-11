(function(){
    var EventEmitter = require('events').EventEmitter,
        util = require('util');

    function callable(originalConstructor) {
        var wrappedConstructor = function () {
            var newObject = function () {
                wrappedConstructor.prototype.call.apply(this, arguments);
            };
            newObject.__proto__ = wrappedConstructor.prototype;
            originalConstructor.apply(newObject, arguments);
            return newObject;
        };
        return wrappedConstructor;
    }

    var Any = callable(function Any() {
    });

    util.inherits(Any, EventEmitter);

    Any.prototype.call = function(req, callback) {
        callback(undefined, true);
    };

    module.exports = {
        Any: Any
    };

})();
