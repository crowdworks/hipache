(function () {
    /*globals describe:false, it:false*/
    'use strict';

    var expect = require('chai').expect;

    var Factory = require('../../../lib/plugins/rollout/factory');
    var Loader = require('../../../lib/routes').Loader;

    var factory = Factory.fromDependencies({
        redisOptions: {
            host: '127.0.0.1',
            port: 6379
        },
        pathMatchingOptions: {
            prefix: 'rollout_paths:'
        },
        includedInSegmentOptions: {
            cookie: '_myapp_session_id',
            maxSegmentId: 75
        }
    });

    var config = {
        condition: {
            and: {
                //module: {
                //    name: './routes/conditions/and'
                //},
                conditions: [
                    {
                        pathMatches: {
                            //module: {
                            //    name: "./routes/conditions/match_path_defined_in"
                            //},
                            prefix: "overrode_prefix"
                        }
                    },
                    {
                        includedInSegment: {
                            //module: {
                            //    name: "./routes/conditions/percentage_of_segment"
                            //},
                            cookie: "overrode_cookie",
                            maxSegmentId: 77
                        }
                    },
                    {
                        includedInSegment: {}
                    }
                ]
            }
        },
        destination: {
            randomBackendForHost: {
                driver: "redis://:pass@127.0.0.1#rollout"
            }
        }
    };

    describe('routes.Loader', function () {
        describe('#load', function () {
            it('load a route from JSON object', function () {
                var loader = new Loader(factory, factory.createConditionLoader(), factory.createDestinationLoader());
                var route = loader.load(config);

                expect(route.condition.conditions[0].options.prefix).to.eql('overrode_prefix');
                expect(route.condition.conditions[1].options.cookie).to.eql('overrode_cookie');
                expect(route.condition.conditions[1].options.maxSegmentId).to.eql(77);
                expect(route.condition.conditions[2].options.cookie).to.eql('_myapp_session_id');
                expect(route.condition.conditions[2].options.maxSegmentId).to.eql(75);
                expect(route.destination.lru).to.be.ok;
                expect(route.destination.client).to.be.ok;
                expect(route.destination.client.prefix).to.eql('rollout');

                factory.destructor();
            });
        });
    });
})();
