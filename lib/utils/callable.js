(function() {
    'use strict';

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

    module.exports = {
        callable: callable
    };
})();
