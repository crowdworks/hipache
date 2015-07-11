(function () {
    /*globals describe:false, it:false*/
    'use strict';

    var expect = require('chai').expect;

    var And = require('../../../../lib/routes/conditions/and').And;

    function successfulCond(req, nodeback) { nodeback(undefined, !!req); }
    function failingCond(req, nodeback) { nodeback(undefined, !!!req); }

    describe('And', function () {
        describe('#call', function () {
            it('returns true when all the conditions resulted in truthy values', function (done) {
                var callable = {
                    call: successfulCond
                };
                var req = {req:{name:"foo"}};

                new And([successfulCond, successfulCond, callable]).call(req, function(err, data) {
                    expect(data[1]).to.eql(true);
                    done();
                });
            });

            it('returns false when one of the conditions resulted in a falsey value', function (done) {
                var callable = {
                    call: failingCond
                };
                var req = {req:{name:"foo"}};

                new And([successfulCond, successfulCond, callable]).call(req, function(err, data) {
                    expect(data[1]).to.eql(false);
                    done();
                });
            });
        });
    });
})();
