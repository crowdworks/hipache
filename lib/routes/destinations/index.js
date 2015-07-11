(function() {
    'use strict';

    var mergeModuleExports = require('../../utils/mergemoduleexports');

    mergeModuleExports(module.exports, require('./loader'));
    mergeModuleExports(module.exports, require('./random_backend_for_host'));
})();
