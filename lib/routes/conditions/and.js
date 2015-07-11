(function(){
    'use strict';

    var when = require('when'),
        callbacks = require('when/callbacks'),
        bindCallback = require('when/node').bindCallback,
        EventEmitter = require('events').EventEmitter,
        util = require('util'),
        utils = require('../../utils');

    var And = utils.callable(function(conditions, options) {
        this.conditions = conditions;
        this.options = options;
    });

    util.inherits(And, EventEmitter);

    And.prototype.call = function(req, callback) {
        return bindCallback(
            when.all(
                this.conditions.map(function(condition) {
                    var boundCallback;
                    if (typeof condition === 'function') {
                        boundCallback = condition.bind(condition);
                    } else {
                        boundCallback = condition.call.bind(condition);
                    }

                    return callbacks.call(boundCallback, req);
                })
            ).then(function(results) {
                    var result = true;
                    for (var i=0; i<results.length; i++) {
                        result = result && results[i];
                    }
                    return result;
            }),
            callback
        );
    };

    module.exports = {
        And: And
    };

})();
