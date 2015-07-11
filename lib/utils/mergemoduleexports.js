(function() {
    'use strict';

    function mergeModuleExports(exports, other) {
        for (var name in other) {
            exports[name] = other[name];
        }
    }

    module.exports = mergeModuleExports;
})();
