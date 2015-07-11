(function() {
    'use strict';

    var mergeModuleExports = require('./mergemoduleexports');

    mergeModuleExports(module.exports, { mergeModuleExports: mergeModuleExports });
    mergeModuleExports(module.exports, require('./callable'));
})();
