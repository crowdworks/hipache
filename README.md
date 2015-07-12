Lopache: a Distributed, Extensible HTTP and WebSocket Proxy
===============================================

[![NPM version][npm-image]][npm-url] [![Build Status][travis-image]][travis-url]
[![Dependency Status][depstat-image]][depstat-url] [![Coverage
Status][coveralls-image]][coveralls-url] [![Code
Climate][codeclimate-image]][codeclimate-url] [![Stories in
Ready][waffle-image]][waffle-url]

What Is It?
-----------

Lopache (pronounce `lo'pætʃɪ`) is a distributed, extensible HTTP and WebSocket proxy which was originally based on [Hipache](https://github.com/hipache/hipache).
Lopache borrows Hipache's robust multi-process architecture and [features](https://github.com/hipache/hipache#features), adding the ability to configure routing and the plugin architecture supporting it.

You can use Lopache as a drop-in replacement for Hipache or for more complicated use cases requiring intelligent routing to backends e.g. like delivering fundamental changes to your application safer. You can even use Lopache as a framework to build your own HTTP and WebSocket Proxy. Try Lopache before you decide "I have to write my own HTTP proxy".

Use cases
---------

Lopache is developed at [CrowdWorks](https://crowdworks.jp) to reduce efforts required to achieve
rolling releases of library or framework updates to large Web applications e.g. Rails and Rack middleware updates to large Rails apps in a safer way.

Delivering updates for your application's fundamental parts e.g. Web frameworks, HTTP middlewares has potential risks in the scenarios like:

* Session incompatiblity between multiple versions of WAF e.g. version X stores sessions as YAML, version Y stores sessions as JSON. Once the user updated his/her session in Y and later you've rolled back your app to use the framework version X, everyone's request starts failing because of session decoding failure.
* Breaking changes on the framework combined with mutable operations. If the framework version X 

Rolling-out strategy like routing percentages of the HTTP requests to the rollout environment won't work in these scenarios.
Imagine that framework version X and Y has session imcompatibility and you've configured your load balancer to route 90% of requests to servers running the framework version X and the rest of the reqeusts to the framework version Y.
Every user can eventually be routed to version Y because the load banacer is routing based on requests.
Once the user is routed to version Y, 90% of his/her subsequent requests start failing because of session imcompatibility.

Using Lopache, you can run a distributed HTTP reverse proxy which proxies all the requests to your Web site and routes those to backends according to each user's session ID. Using session ID based routing, you can limit risks to minimum in the above scenarios because each user is always routed to version X or Y.

Run It!
-------

### 1. Installation

From the shell:

    $ npm install lopache -g

_The '-g' option will make the 'lopache' bin-script available system-wide
(usually linked from '/usr/local/bin')._


### 2. Configuration File

Basic Lopache configuration is described in a `config.json` file. For example,
this is the configuration file for the `master` version of Lopache (i.e. under
development, you should rather look at the documentation of the latest stable
version you installed):

    {
        "server": {
            "debug": false,
            "workers": 10,
            "maxSockets": 100,
            "tcpTimeout": 30,
            "deadBackendTTL": 30,
            "retryOnError": 3,
            "accessLog": "/var/log/lopache/access.log",
            "httpKeepAlive": false,
            "deadBackendOn500": true,
            "staticDir": null
        },
        "http": {
            "port": 80,
            "bind": ["127.0.0.1"]
        },
        "routes": [
            {
                "condition": {
                    "and": {
                        "conditions": [
                            { "pathMatchesPattern": { driver: "redis:" } },
                            { "sessionIsIncludedInSegment": { cookie: "_myapp_session_id", maxSegmentId: 50 } }
                        ]
                    }
                },
                "destination": {
                    "randomBackendForHost": {
                        driver: "redis:#rollout"
                    }
                }
            }
        ],
        "driver": "redis:",
        "user": "www-data",
        "group": "www-data"
    }

 * __server__: generic server settings, like accesslog location, or number of
   workers
    * __server.debug__: debug mode.
    * __server.workers__: number of workers to be spawned. You need to request
      to have at least 1 worker, as the master process does not serve any
      request. Defaults to `10` if not specified.
    * __server.maxSockets__: the maximum number of sockets which can be opened
      on each backend (per worker). Defaults to `100` if not specified.
    * __server.tcpTimeout__: the number of seconds of inactivity on the socket
      to wait before timeout-ing it. If sets to `0`, then the existing idle
      timeout is disabled. Defaults to `30` seconds.
    * __server.deadBackendTTL__: the number of seconds a backend is flagged as
      'dead' before retrying to proxy another request to it (doesn't apply if
      you are using a third-party health checker). Defaults to `30` seconds.
    * __server.retryOnError__: retries limit. Defaults to `3`.
    * __server.accessLog__: location of the Access logs, the format is the same
      as nginx. Defaults to `/var/log/lopache/access.log` if not specified.
    * __server.httpKeepAlive__: enable/disable keep-alive functionality.
      Defaults to `false` (disabled).
    * __server.deadBackendOn500__: consider `500` HTTP status code as critical
      error if sets to `true`. Defaults to `true`.
    * __server.staticDir__: the absolute path of the directory containing your
      custom static error pages. Default value `null` means it uses Lopache's
      pages. Defaults to Lopache's `static/` directory.
 * __http__: specifies on which ips/ports Lopache will listen for http traffic.
   By default, Lopache listens only on 127.0.0.1:80
    * __http.port__: port to listen to for http. Defaults to `80`.
    * __http.bind__: IPv4 (or IPv6) address, or addresses to listen to. You can
      specify a single ip, an array of ips, or an array of objects `{address:
      IP, port: PORT}` if you want to use a specific port on a specific ip.
      Defaults to `127.0.0.1`.
 * __https__: specifies on which ips/ports Lopache will listen for https
   traffic. By default, Lopache doesn't listens for https traffic.
    * __https.port__: port to listen to for https. Defaults to `443`.
    * __https.key__: path to key file to use. No default.
    * __https.passphrase__: optional passphrase for the key file. No default.
    * __https.cert__: path to certificate file to use. No default.
    * __https.ca__: optional path to additional CA file to serve. Might be a
      string, or an array.
    * __https.bind__: similarly to http.bind, you can specific a single IP, an
      array of IP, or an array of objects to override the port, key/cert/ca
      files on a per-IP basis.
    * __https.secureProtocol__: SSL/TLS protocol to use. Defaults to
      `SSLv23_method` (auto-negotiation).
    * __https.secureOptions__: extra options to pass to the SSL/TLS layer. Raw
      values must be provided. For instance, defaults is `50331648`, and stands
      for `SSL_OP_NO_SSLv3 | SSL_OP_NO_SSLv2` (constants).
    * __https.ciphers__: cipher suites. See the default value above.
    * __https.honorCipherOrder__: when choosing a cipher, use the server's
      preferences instead of the client preferences. Defaults to `true`.
 * __driver__: driver URL to connect to for dynamic VHOST configurations. See
   [drivers section](#drivers) for more information. Defaults to `redis:`.
 * __user__: if starting as `root` (which you might do if you want to use a
   privileged port), will drop root privileges as soon as it's bound. Defaults
   to `www-data`. Note that you MUST specify a user if you start Lopache as
   root. You can specify `user: 'root'` if you don't mind (strongly
   discouraged!). You can use either user names or identifiers.
 * __group__: if starting as `root`, will downgrade group to this. If left
   empty, will try to downgrade to a group named after the specified `user`.
   Defaults to `www-data`.


### 3. Spawning

From the shell (defaults to using the `config/config.json` file):

    $ lopache

If you use a privileged port (e.g.: `80`):

    $ sudo lopache

If you want to use a specific configuration file:

    $ lopache --config path/to/someConfig.json

If you want to just test a specific configuration file:

    $ lopache --dry --config path/to/someConfig.json

__Managing multiple configuration files:__

The default configuration file is `config/config.json`. It's possible to have
different configuration files named `config_<suffix>.json`, where the suffix is
the value of an environment variable named `SETTINGS_FLAVOR`.

For instance, here is how to spawn the server with the `config_test.json`
configuration file in order to run the tests.

    $ SETTINGS_FLAVOR=test lopache


### 4. VHOST Configuration

All VHOST configuration is managed through a configuration backend (cf.
[drivers](#drivers)). This makes it possible to update the configuration
dynamically and gracefully while the server is running, and have that state
shared across workers and even across Lopache instances.

The recommended backend to use is **Redis**. It also makes it simple to write
configuration adapters. It would be trivial to load a plain text configuration
file into Redis (and update it at runtime).

Different configuration adapters will follow, but for the moment you have to
provision the Redis manually.

Let's take an example to proxify requests to 2 backends for the hostname
`www.dotcloud.com`. The 2 backends IP are `192.168.0.42` and `192.168.0.43` and
they serve the HTTP traffic on the port `80`.

`redis-cli` is the standard client tool to talk to Redis from the terminal.

Follow these steps:

1. __Create__ the frontend and associate an identifier:

        $ redis-cli rpush frontend:crowdworks.jp mywebsite
        (integer) 1

The frontend identifer is `mywebsite`, it could be anything.

2. __Associate__ the 2 backends:

        $ redis-cli rpush frontend:crowdworks.jp http://192.168.0.42:80
        (integer) 2
        $ redis-cli rpush frontend:crowdworks.jp http://192.168.0.43:80
        (integer) 3

3. __Review__ the configuration:

        $ redis-cli lrange frontend:crowdworks.jp 0 -1
        1) "mywebsite"
        2) "http://192.168.0.42:80"
        3) "http://192.168.0.43:80"

While the server is running, any of these steps can be re-run without messing up
with the traffic.

### 5. OS Integration

__Upstart__

Copy `upstart.conf` to __/etc/init/lopache.conf__. Then you can use:

```
start lopache
stop lopache
restart lopache
```

The configuration file used is `/etc/lopache.json`.


Drivers
-------

Lopache supports several drivers for dynamic VHOST configurations.

### Redis

This is the default backend.

If you want a master/slave Redis, specify a second url for the master, e.g.:
`driver: ["redis://slave:port", "redis://master:port"]`. More generally, the
driver syntax is: `redis://:password@host:port/database#prefix` - all parameter
are optional, hence just `redis:` is a valid driver URI.  You can omit this
entirely to use the local redis on the default port, which is the default.


Features
--------

### Load-Balancing Across Multiple Backends

As seen in the example above, multiple backends can be attached to a frontend.

All requests coming to the frontend are load-balanced across all healthy
backends.

The backend to use for a specific request is determined randomly. Subsequent
requests coming from the same client won't necessarily be routed to the same
backend (since backend selection is purely random).

### Dead Backend Detection

If a backend stops responding, it will be flagged as dead for a configurable
amount of time. The dead backend will be temporarily removed from the
load-balancing rotation.

### Multi-Process Architecture

To optimize response times and make use of all your available cores, Lopache
uses the cluster module (included in NodeJS), and spreads the load across
multiple NodeJS processes. A master process is in charge of spawning workers and
monitoring them. When a worker dies, the master spawns a new one.

### Memory Monitoring

The memory footprint of Lopache tends to grow slowly over time, indicating a
probable memory leak. A close examination did not turn up any memory leak in
Lopache's code itself; but it doesn't prove that there is none. Also, we did not
investigate (yet) thoroughly the code of Lopache's external dependencies, so the
leaks could be creeping there.

While we profile Lopache's memory to further reduce its footprint, we
implemented a memory monitoring system to make sure that memory use doesn't go
out of bounds. Each worker monitors its memory usage. If it crosses a given
threshold, the worker stops accepting new connections, it lets the current
requests complete cleanly, and it stops itself; it is then replaced by a new
copy by the master process.

### Dynamic Configuration

You can alter the configuration stored in Redis at any time. There is no need to
restart Lopache, or to signal it that the configuration has changed: Lopache
will re-query Redis at each request. Worried about performance?  We were, too!
And we found out that accessing a local Redis is helluva fast.  So fast, that it
didn't increase measurably the HTTP request latency!

### WebSocket

Lopache supports the WebSocket protocol. It doesn't do any fancy handling
on its own and relies entirely on NodeJS and node-http-proxy.

### SSL

Lopache supports SSL for "regular" requests as well as WebSocket upgrades.
Lopache's default configuration matches latest recommandations for a secure and
well-configured SSL/TLS layer.

### Custom HTML Error Pages

When something wrong happens (e.g., a backend times out), or when a request for
an undefined virtual host comes in, Lopache will display an error page. Those
error pages can be customized, and a configuration parameter (`server.staticDir`)
is available to specify where these custom pages are located.

### Wildcard Domains Support

When adding virtual hosts in Lopache configuration, you can specify wildcards.
E.g., instead (or in addition to) `www.example.tld`, you can insert
`*.example.tld`. Lopache will look for an exact match first, and then for a
wildcard one up to 5 subdomains deep, e.g. `foo.bar.baz.qux.quux` will attempt
to match itself first, then `*.bar.baz.qux.quux`, then `*.baz.qux.quux`, etc.

### Active Health-Check

Even though Lopache support passive health checks, it's also possible to run
active health checks. This mechanism requires to run an external program (see
third-party softwares below).


Contributing
------------

See [CONTRIBUTING.md](CONTRIBUTING.md)


[npm-url]: https://npmjs.org/package/hipache
[npm-image]: https://badge.fury.io/js/hipache.png

[travis-url]: http://travis-ci.org/crowdworks/lopache
[travis-image]: https://secure.travis-ci.org/crowdworks/lopache.png?branch=master

[coveralls-url]: https://coveralls.io/r/crowdworks/lopache
[coveralls-image]: https://coveralls.io/repos/crowdworks/lopache/badge.png?branch=master

[depstat-url]: https://david-dm.org/hipache/hipache
[depstat-image]: https://david-dm.org/hipache/hipache.png

[codeclimate-url]: https://codeclimate.com/github/crowdworks/lopache
[codeclimate-image]: https://codeclimate.com/github/crowdworks/lopache.png

[waffle-url]: https://waffle.io/hipache/hipache
[waffle-image]: https://badge.waffle.io/hipache/hipache.png?label=in%20progress&title=Ready
