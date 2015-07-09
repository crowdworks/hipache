(function() {
    function mergeModuleExports(exports, other) {
        for (var name in other) {
            exports[name] = other[name];
        }
    }

    mergeModuleExports(module.exports, require('./loader'));
    mergeModuleExports(module.exports, require('./random_backend_for_host'));
})();
