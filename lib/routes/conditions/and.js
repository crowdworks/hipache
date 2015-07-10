(function(){
    var when = require('when'),
        callbacks = require('when/callbacks'),
        bindCallback = require('when/node').bindCallback,
        EventEmitter = require('events').EventEmitter,
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

    var And = callable(function And(conditions, options) {
        this.conditions = conditions;
        this.options = options;
    });

    util.inherits(And, EventEmitter);

    // function f(req,callback) { console.log("f:"+req); callback(undefined, req) }; var And = require('./lib/plugins/rollout/routing_conditions/and').And; var p = new And([f, f, {call:function(req,bk){ bk(undefined,req) }}]).call({req:{name:"foo"}}, function(err,data) { console.log(err,data) }); p
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
