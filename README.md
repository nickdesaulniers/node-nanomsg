# nanomsg for node

[![Build Status](https://travis-ci.org/nickdesaulniers/node-nanomsg.svg?branch=master)](https://travis-ci.org/nickdesaulniers/node-nanomsg) [![Build status](https://ci.appveyor.com/api/projects/status/07j7o9juuktas2uk)](https://ci.appveyor.com/project/tcr/node-nanomsg)

### install:

```
npm install nanomsg
```

### check it out:

```js
var nano = require('nanomsg');

var pub = nano.socket('pub');
var sub = nano.socket('sub');

var addr = 'tcp://127.0.0.1:7789'
pub.bind(addr);
sub.connect(addr);

sub.on('message', function (buf) {
	console.log(buf.toString());
	pub.close();
	sub.close();
});

setTimeout(function () {
	pub.send("Hello from nanomsg!");
}, 100);
```

# API

### nano.socket(type, [options,])

Starts a new socket. The nanomsg socket can bind or connect to multiple heterogeneous endpoints as well as shutdown any of these established links.

#### `options`
* `'raw'` *(Boolean, default: `false`)*: determines the domain of the socket. `AF_SP`, the default, creates a standard full-blown SP socket. `AF_SP_RAW` family sockets operate over internal network protocols and interfaces. Raw sockets omit the end-to-end functionality found in `AF_SP` sockets and thus can be used to implement intermediary devices in SP topologies, see [nanomsg docs](http://nanomsg.org/v0.5/nn_socket.3.html) or consult your man page entry `socket(2)` for more info.
```js
//ex. starting raw sockets
nano.socket('bus', { raw: true } );
```
* `'tcpnodelay'` *(Boolean, default: `false`)*: see [`socket.tcpnodelay(boolean)`](https://github.com/nickdesaulniers/node-nanomsg#sockettcpnodelayboolean)
* `'linger'` *(Number, default: `1000`)*: see [`socket.linger(duration)`](https://github.com/nickdesaulniers/node-nanomsg#socketlingerduration)
* `'sndbuf'` *(Number, size in bytes, default: `128kB`)*: see [`socket.sndbuf(size)`](https://github.com/nickdesaulniers/node-nanomsg#socketsndbufsize)
* `'rcvbuf'` *(Number, size in bytes, default: `128kB`)*: see [`socket.rcvbuf(size)`](https://github.com/nickdesaulniers/node-nanomsg#socketrcvbufsize)
* `'sndtimeo'` *(Number, default: `-1`)*: see [`socket.sndtimeo(duration)`](https://github.com/nickdesaulniers/node-nanomsg#socketsndtimeoduration)
* `'rcvtimeo'` *(Number, default: `-1`)*: see [`socket.rcvtimeo(duration)`](https://github.com/nickdesaulniers/node-nanomsg#socketrcvtimeoduration)
* `'reconn'` *(Number, default: `100`)*: see [`socket.reconn(duration)`](https://github.com/nickdesaulniers/node-nanomsg#socketreconnduration)
* `'maxreconn'` *(Number, default: `0`)*: see [`socket.maxreconn(duration)`](https://github.com/nickdesaulniers/node-nanomsg#socketmaxreconnduration)
* `'sndprio'` *(Number, default: `0`)*: see [`socket.sndprio(priority)`](https://github.com/nickdesaulniers/node-nanomsg#socketsndpriopriority)
* `'rcvprio'` *(Number, default: `0`)*: see [`socket.rcvprio(priority)`](https://github.com/nickdesaulniers/node-nanomsg#socketrcvpriopriority)
* `'ipv6'` *(Boolean, default: `false`)*: see [`socket.ipv6(boolean)`](https://github.com/nickdesaulniers/node-nanomsg#socketipv6boolean)
* `'chan'` *(Array, default: `['']`)*: see [`socket.chan(Array)`](https://github.com/nickdesaulniers/node-nanomsg#socketchanarray)

### socket.shutdown(address)

*(Function, param: String)*: Removes an endpoint established  by calls to `bind()` or `connect()`. The nanomsg library will try to deliver any outstanding outbound messages to the endpoint for the time specified by `linger`.

```js
socket.shutdown('tcp://127.0.0.1:5555');
```

### socket.bind(address)

*(Function, param: String)*: Adds a local endpoint to the socket. The endpoint can be then used by other applications to connect.

`bind()` (or `connect()`) may be called multiple times on the same socket thus allowing the socket to communicate with multiple heterogeneous endpoints.

```js
socket.bind('tcp://eth0:5555');
```

*<sub>recommend checking your machine's `ifconfig` first before using a named interface. `ipconfig` on windows.</sub>*

### socket.connect(address)

*(Function, param: String)*: Adds a remote endpoint to the socket. The nanomsg library would then try to connect to the specified remote endpoint.

`connect()` (as well as `bind()`) may be called multiple times on the same socket thus allowing the socket to communicate with multiple heterogeneous endpoints.

```js
socket.connect('tcp://127.0.0.1:5555');
```

*<sub>When connecting over remote TCP allow `100ms` or more depending on round trip time for the operation to complete.</sub>*

##### *[a note on address strings](docs/address_strings.markdown)*

### socket.close()

*(Function, param: Function)*: Closes the socket. Any buffered inbound messages that were not yet received by the application will be discarded. The nanomsg library will try to deliver any outstanding outbound messages for the time specified by `linger`.

### socket.chan(Array)

*(Function, param: Array of Strings, default: `['']`)*: Allows for sub sockets
to filter messages based on a prefix. Not applicable to non sub sockets.

By default, all sub sockets are subscribed to the `''` channel.  Once you opt
in to filtering on a channel, you are unsubscribed from `''`.

### socket.rmchan(String)

*(Function, param: String)*: Allows for sub sockets to remove channel filters.
Not applicable to non sub sockets. This function is variadic; you can pass
multiple strings and all will be unfiltered.

If you unsubscribe from the default channel, `''`, without subscribing to any
new channels, your sub socket will stop receiving messages.

### socket.tcpnodelay(boolean)

*(Function, param: Boolean, default: false)*: When set, disables Nagle’s algorithm. It also disables delaying of TCP acknowledgments. Using this option improves latency at the expense of throughput.

Pass no parameter for current tcp nodelay setting.

```js
//default
console.log(socket.tcpnodelay()); //tcp nodelay: off

socket.tcpnodelay(true); //disabling Nagle's algorithm

console.log(socket.tcpnodelay()); //tcp nodelay: on
```

### socket.linger(duration)

*(Function, param: Number, default: `1000`)*: Specifies how long the socket should try to send pending outbound messages after `socket.close()` or `socket.shutdown()` is called, in milliseconds.

Pass no parameter for the linger duration.

```js
socket.linger(5000);
console.log(socket.linger()); //5000
```

### socket.sndbuf(size)

*(Function, param: Number, size in bytes, default: `128kB`)*: Size of the send buffer, in bytes. To prevent blocking for messages larger than the buffer, exactly one message may be buffered in addition to the data in the send buffer.

Pass no parameter for the socket's send buffer size.

```js
socket.sndbuf(131072);
console.log(socket.sndbuf()); // 131072
```

### socket.rcvbuf(size)

*(Function, param: Number, size in bytes, default: `128kB`)*: Size of the receive buffer, in bytes. To prevent blocking for messages larger than the buffer, exactly one message may be buffered in addition to the data in the receive buffer.

Pass no parameter for the socket's receive buffer size.

```js
socket.rcvbuf(20480);
console.log(socket.rcvbuf()); // 20480
```

### socket.sndtimeo(duration)

*(Function, param: Number, default: `-1`)*: The timeout for send operation on the socket, in milliseconds.

Pass no parameter for the socket's send timeout.

```js
socket.sndtimeo(200);
console.log(socket.sndtimeo()); // 200
```

### socket.rcvtimeo(duration)

*(Function, param: Number, default: `-1`)*: The timeout for recv operation on the socket, in milliseconds.

Pass no parameter for the socket's recv timeout.

```js
socket.rcvtimeo(50);
console.log(socket.rcvtimeo()); // 50
```

### socket.reconn(duration)

*(Function, param: Number, default: `100`)*: For connection-based transports such as TCP, this option specifies how long to wait, in milliseconds, when connection is broken before trying to re-establish it. Note that actual reconnect interval may be randomized to some extent to prevent severe reconnection storms.

Pass no parameter for the socket's `reconnect` interval.

```js
socket.reconn(600);
console.log(socket.reconn()); // 600
```

### socket.maxreconn(duration)

*(Function, param: Number, default: `0`)*: <strong>Only to be used in addition to `socket.reconn()`.</strong> `maxreconn()` specifies maximum reconnection interval. On each reconnect attempt, the previous interval is doubled until `maxreconn` is reached. Value of zero means that no exponential backoff is performed and reconnect interval is based only on `reconn`. If `maxreconn` is less than `reconn`, it is ignored.

Pass no parameter for the socket's `maxreconn` interval.

```js
socket.maxreconn(60000);
console.log(socket.maxreconn()); // 60000
```

### socket.sndprio(priority)

*(Function, param: Number, default: `8`)*: Sets outbound priority for endpoints subsequently added to the socket.

This option has no effect on socket types that send messages to all the peers. However, if the socket type sends each message to a single peer (or a limited set of peers), peers with high priority take precedence over peers with low priority.

Highest priority is 1, lowest is 16. Pass no parameter for the socket's current outbound priority.

```js
socket.sndprio(2);
console.log(socket.sndprio()); // 2
```

### socket.rcvprio(priority)

*(Function, param: Number, default: `8`)*: Sets inbound priority for endpoints subsequently added to the socket.

This option has no effect on socket types that are not able to receive messages.

When receiving a message, messages from peer with higher priority are received before messages from peer with lower priority.

Highest priority is 1, lowest is 16. Pass no parameter for the socket's current inbound priority.

```js
socket.rcvprio(10);
console.log(socket.rcvprio()); // 10
```

### socket.ipv6(boolean)

*(Function, param: Boolean, default: `false`)*: Allows for the use of IPv6 addresses to bind or connect to.

By default, nanomsg only works with IPv4 addresses, and support for IPv6 addresses must explicitly be enabled.

If enabled, both IPv4 and IPv6 addresses can be used.

```js
socket.ipv6(true);
console.log(socket.ipv6()); // true
```

# test

```bash
$ git clone https://github.com/nickdesaulniers/node-nanomsg.git nano
$ cd nano && git submodule update --init

# now you can build the project and run the test suite:
$ make && make check

# or perhaps you'd prefer to use the npm commands instead:
$ npm i
$ npm t

# let's say you switch to another version of node/iojs, you might want to run:
$ make clean && make && make check

# for the super deluxe make clean, rebuild, and test suite:
$ make full
```

Note: you must `git submodule update --init` to initialize the nanomsg repository.

# performance

run benchmarks:
```bash
$ make perf
```

for more info how to do that and your own custom comparisons check out: [running benchmarks](https://github.com/JustinTulloss/zeromq.node#running-benchmarks)

and if you want you can also run:
```bash
$ make bench
```
:)

## contributing

Issues and pull requests welcome!

## formatting

### C/C++
Please run `clang-format -style=Mozilla -i <file>` on all C/C++ code.

### JS
WIP

## license

MIT
