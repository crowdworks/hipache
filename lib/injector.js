(function() {
    var Definition = function Definition(name, deps, func, instantiate) {
        this.name = name;
        this.deps = deps;
        this.func = func;
        this.instantiate = Definition.InstantiationStrategies[instantiate];
    };

    Definition.InstantiationStrategies = {
        ctor: function(ctor) { return new ctor(); },
        func: function(func) { return func(); }
    };

    Definition.prototype.buildInjectsParams = function(context) {
        return [this.deps, this.func].concat([context]);
    };

    Definition.prototype.instantiate = function(injected) {
        return this.instantiate(injected);
    };

    var Injector = function Injector() {
        this.dependencies = {};
        this.definitions = {};
    };

    Injector.prototype.define = function(name, deps, func, instantiate) {
        instantiate = instantiate || 'ctor';

        this.definitions[name] = new Definition(name, deps, func, instantiate);
    };

    Injector.prototype.create = function(name, context) {
        var context = this.contextWithDefaults(context);
        var definition = this.definitions[name];
        if (definition) {
            var injected = this.inject.apply(this, definition.buildInjectsParams(context));
            var component = definition.instantiate(injected);

            this.register(name, component);

            return component;
        } else {
            throw new Error('Can\'t instantiate ' + name);
        }
    };

    Injector.prototype.register = function(name, component) {
        if (this.dependencies[name]) {
            throw new Error(name + " is already registered.");
        }

        this.dependencies[name] = component;
    };

    Injector.prototype.resolve = function(name, context) {
        var context = this.contextWithDefaults(context);
        var dep;

        if (context.unresolved[name]) {
            throw new Error('Cyclic dependency from and to ' + name + ' detected');
        } else {
            context.unresolved[name] = true;
        }

        if (this.dependencies[name]) {
            dep = this.dependencies[name];
        } else {
            try {
                dep = this.create(name, context);
            } catch(e) {
                throw new Error('Can\'t resolve ' + name + ': ' + e.message);
            }
        }
        return dep;
    };

    Injector.prototype.inject = function(deps, func, context) {
        var context = this.contextWithDefaults(context);
        var args = [];
        for (var i=0; i<deps.length, d=deps[i]; i++) {
            args.push(this.resolve(d, context));
        }
        // To support injection to ctors,
        return function() {
            // we inherit the prototype of the original ctor and
            if (typeof this !== 'undefined') {
                this.__proto__ = func.prototype;
            }

            // bind arguments to the ctor
            return func.apply(this, args.concat(Array.prototype.slice.call(arguments, 0)));
        }
    };

    Injector.prototype.contextWithDefaults = function(context) {
        return context || { unresolved: {} };
    };

    module.exports = { Injector: Injector };
})();
