(function () {
    /*globals describe:false, it:false*/
    'use strict';

    var expect = require('chai').expect;

    var Factory = require('../../../../lib/routes/factory');
    var Loader = require('../../../../lib/routes/conditions/loader').Loader;

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
    };

    describe('conditions.Loader', function () {
        describe('#load', function () {
            it('returns true when all the conditions resulted in truthy values', function () {
                var req = {req:{name:"foo"}};
                var loader = new Loader(factory);
                var cond = loader.load(config);

                expect(cond.conditions[0].options.prefix).to.eql('overrode_prefix');
                expect(cond.conditions[1].options.cookie).to.eql('overrode_cookie');
                expect(cond.conditions[1].options.maxSegmentId).to.eql(77);
                expect(cond.conditions[2].options.cookie).to.eql('_myapp_session_id');
                expect(cond.conditions[2].options.maxSegmentId).to.eql(75);

                factory.destructor();
            });
        });
    });
})();
