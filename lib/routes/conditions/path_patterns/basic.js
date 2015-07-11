(function() {
    'use strict';

    var BasicPathPattern = function BasicPathPattern() {
    };

    BasicPathPattern.prototype.getPatternsForPath = function(path) {
        var parts = path.split("/");

        // getPatternsForPath('/public/jobs/1')
        // //=> [ '/*', '/public/*', '/public/jobs/*', '/public/jobs/1' ]
        var keys = new Array(parts.length);
        for (var i=0; i<parts.length; i++) {
            keys[i] = parts.slice(0, i+1).join("/") + (i < parts.length - 1 ? '/*' : '');
        }

        return keys;
    };

    module.exports = {
        BasicPathPattern: BasicPathPattern
    };
})();
