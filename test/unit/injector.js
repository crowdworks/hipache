(function () {
    /*globals describe:false, it:false*/
    'use strict';

    var expect = require('chai').expect;

    var Injector = require('../../lib/injector').Injector;

    describe('Injector', function () {
        describe('#getDependencyNames', function () {
            it('returns all the dependencies names', function () {
                var deps = { foo: 1, bar: 2 };
                var defs = {};
                var injector = new Injector(deps, defs);

                expect(injector.getDependencyNames()).to.eql(['foo', 'bar']);

                var merged = injector.mergeDependencies({ baz: 3 });

                expect(merged.getDependencyNames()).to.eql(['foo', 'bar', 'baz']);
            });
        });
    });
})();
