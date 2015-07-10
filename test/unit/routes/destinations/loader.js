(function () {
    /*globals describe:false, it:false*/
    'use strict';

    var expect = require('chai').expect;

    var Factory = require('../../../../lib/routes/factory');
    var destinations = require('../../../../lib/routes/destinations');

    var Loader = destinations.Loader;

    var factory = Factory.fromDependencies({});

    var config = {
        randomBackendForHost: {
            driver: "redis://:pass@127.0.0.1#rollout"
        }
    };

    describe('destinations.Loader', function () {
        describe('#load', function () {
            it('returns true when all the conditions resulted in truthy values', function () {
                var req = {req:{name:"foo"}};
                var loader = new Loader(factory);
                var dest = loader.load(config);

                expect(dest.lru).to.be.ok;
                expect(dest.client).to.be.ok;
                expect(dest.client.prefix).to.eql('rollout');

                factory.destructor();
            });
        });
    });
})();
