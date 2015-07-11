(function(){
    'use strict';

    var util = require('util'),
        EventEmitter = require('events').EventEmitter,
        crc32 = require('buffer-crc32');

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

    var IncludedInSegment = callable(function UserIncludedInSegment(config) {
        try {
            this.initialize(config);
            this.enabled = true;
        } catch (e) {
            console.warn("An error occurred while initializing the Rollout plugin." + e, e.stack.split("\n"));
            this.enabled = false;
        }
    });

    util.inherits(IncludedInSegment, EventEmitter);

    IncludedInSegment.prototype.initialize = function (config) {
        this.config = this.options = config;
        this.sessionIdCookieName = config.cookie;
        this.debugging = config.debug === true;
    };

    IncludedInSegment.prototype.call = function(req, callback) {
        if (!this.enabled) {
            return false;
        }

        var segmentId = this.segmentIdFromRequest(req);

        this.segmentIdIncluded(segmentId, callback);
    };

    IncludedInSegment.prototype.segmentIdIncluded = function(segmentId, callback) {
        var included = segmentId <= this.config.maxSegmentId;
        callback(
            null,
            included
        );
    };

    IncludedInSegment.prototype.segmentIdFromRequest = function (req) {
        var cookies = this.cookiesFromRequest(req);
        var sessionId = cookies[this.sessionIdCookieName];
        var segmentId = crc32.unsigned(sessionId) % 100;

        this.debugPrint(req, cookies, sessionId, segmentId);

        return segmentId;
    };

    IncludedInSegment.prototype.debugPrint = function (req, cookies, sessionId, segmentId) {
        if (this.debugging === true) {
            var data = {
                request: {
                    method: req.method,
                    url: req.url
                },
                headers: {
                    host: req.headers.host,
                    cookie: req.headers.cookie
                },
                cookie: cookies,
                sessionId: sessionId,
                segmentId: segmentId,
                config: this.config
            };
            // TODO use logHandler?
            console.warn(JSON.stringify(data));
        }
    };

    IncludedInSegment.prototype.cookiesFromRequest = function (req) {
        var cookies = {};

        req.headers.cookie.split(';').forEach(function(element) {
            var nameAndValue = element.split('=');
            var name = nameAndValue[0];
            var value = nameAndValue[1];

            cookies[name] = value;
        });

        return cookies;
    };

    module.exports = {
        IncludedInSegment: IncludedInSegment
    };

})();
