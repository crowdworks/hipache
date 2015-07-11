(function(){
    'use strict';

    var EventEmitter = require('events').EventEmitter,
        util = require('util'),
        utils = require('../../utils');

    var Any = utils.callable(function Any() {
    });

    util.inherits(Any, EventEmitter);

    Any.prototype.call = function(req, callback) {
        callback(undefined, true);
    };

    module.exports = {
        Any: Any
    };

})();
