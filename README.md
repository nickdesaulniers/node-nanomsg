# nanomsg for node

[![Build Status](https://travis-ci.org/nickdesaulniers/node-nanomsg.svg?branch=master)](https://travis-ci.org/nickdesaulniers/node-nanomsg) [![Build status](https://ci.appveyor.com/api/projects/status/og7qumak4khcne8u?svg=true)](https://ci.appveyor.com/project/reqshark/node-nanomsg)

### install:

```
npm install nanomsg
```
This is the default way of installing node-nanomsg. Behind the scenes, nanomsg library will be downloaded, built and statically linked, providing the simplest and easiest way to start working.

Another option, if you have a more complex environment/project, and you may already have nanomsg installed on your system, or you want to target a specific version when using it from node:
```
npm install nanomsg --use_system_libnanomsg=true
```
This has the following prerequisites:
* nanomsg must be installed. See https://github.com/nanomsg/nanomsg
* pkg-config must be installed
* only tested on linux, so other platforms are explicitly excluded at the moment (any help testing other OS is welcome)

### check it out:

```js
var nano = require('nanomsg');

var pub = nano.socket('pub');
var sub = nano.socket('sub');

var addr = 'tcp://127.0.0.1:7789'
pub.bind(addr);
sub.connect(addr);

sub.on('data', function (buf) {
  console.log(String(buf));
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
* `'maxttl'` *(Number, default: `8`)*: see [`socket.maxttl(hops)`](https://github.com/nickdesaulniers/node-nanomsg#socketmaxttlhops)
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
* `'rcvmaxsize'` *(Number, default: `false`)*: see [`socket.rcvmaxsize(size)`](https://github.com/nickdesaulniers/node-nanomsg#socketrcvmaxsizesize)
* `'chan'` *(Array, default: `['']`)*: see [`socket.chan(Array)`](https://github.com/nickdesaulniers/node-nanomsg#socketchanarray)
* `'wsopt'` *(String, default: `'binary'`)*: see [`socket.wsopt(str)`](https://github.com/nickdesaulniers/node-nanomsg#socketwsoptstr)
* `'dontwait'` *(boolean, default: `true`)*: see [`socket.dontwait(boolean)`](https://github.com/nickdesaulniers/node-nanomsg#socketdontwaitboolean)

### socket.shutdown(address)

*(Function, param: String)*: Removes an endpoint established  by calls to `bind()` or `connect()`. The nanomsg library will try to deliver any outstanding outbound messages to the endpoint.

```js
socket.shutdown('tcp://127.0.0.1:5555');
```

### socket.bind(address)

*(Function, param: String)*: Adds a local endpoint to the socket. The endpoint can be then used by other applications to connect.

`bind()` (or `connect()`) may be called multiple times on the same socket thus allowing the socket to communicate with multiple heterogeneous endpoints.

```js
socket.bind('tcp://::1:5555');
```

*<sub>recommend checking your machine's `ifconfig` first before using IPv6. `ipconfig` on windows.</sub>*

### socket.connect(address)

*(Function, param: String)*: Adds a remote endpoint to the socket. The nanomsg library would then try to connect to the specified remote endpoint.

`connect()` (as well as `bind()`) may be called multiple times on the same socket thus allowing the socket to communicate with multiple heterogeneous endpoints.

```js
socket.connect('tcp://127.0.0.1:5555');
```

*<sub>When connecting over remote TCP allow `100ms` or more depending on round trip time for the operation to complete.</sub>*

### socket.close()

*(Function, param: Function)*: Closes the socket. Any buffered inbound messages that were not yet received by the application will be discarded. The nanomsg library will try to deliver any outstanding outbound messages.

## nanomsg transports and the endpoint address string

*(String)*

Endpoint address strings consist of two parts as follows: `transport://address`. The transport specifies the underlying transport protocol to use. The meaning of the address part is specific to the underlying transport protocol.
* *TCP transport mechanism*: `'tcp://127.0.0.1:65000'` When binding a TCP socket, address of the form `tcp://interface:port` should be used. Port is the TCP port number to use. Interface is either: `IPv4` or `IPv6` address of a local network interface, or DNS name of the remote box.
* *WebSocket transport mechanism*: `'ws://127.0.0.1:64999'` Implemented on top of TCP, a WebSocket address of the form `ws://interface:port` should be used. Port is the TCP port number to use. Interface is either: `IPv4` or `IPv6` address of a local network interface, or DNS name of the remote box. When calling either `bind()` or `connect()`, omitting the port defaults to the RFC 6455 default port 80 for HTTP. See [examples/ws](examples/ws) for basic implementation over the browser.
* *in-process transport mechanism*: `'inproc://bar'` The `inproc` transport allows messages between threads or modules inside a process. In-process address is an arbitrary case-sensitive string preceded by `inproc://` protocol specifier. All in-process addresses are visible from any module within the process. They are not visible from outside of the process. The overall buffer size for an inproc connection is determined by `rcvbuf` socket option on the receiving end of the connection. `sndbuf` is ignored. In addition to the buffer, one message of arbitrary size will fit into the buffer. That way, even messages larger than the buffer can be transfered via inproc connection.
* *inter-process transport mechanism*: `'ipc:///tmp/foo.ipc'` The `ipc` transport allows for sending messages between processes within a single box. The nanomsg implementation uses native IPC mechanism provided by the local operating system and the IPC addresses are thus OS-specific. On POSIX-compliant systems, UNIX domain sockets are used and IPC addresses are file references. Note that both relative (`ipc://test.ipc`) and absolute (`ipc:///tmp/test.ipc`) paths may be used. Also note that access rights on the IPC files must be set in such a way that the appropriate applications can actually use them. On Windows, named pipes are used for IPC. The Windows IPC address is an arbitrary case-insensitive string containing any character except for backslash: internally, address `ipc://test` means that named pipe `\\.\pipe\test` will be used.

## sending and receiving: writable and readable

### socket.send(msg)
*(Function, param: String or Buffer)*: send a message.

```js
socket.send('hello from nanømsg!');
```

`send(msg)` is automatically invoked during `Writable` consumption of some other `Readable` stream. In that case a `Writable`'s `pipe()` method can be used to transmit across readable data sources. See [example for more detail](examples/writablepipe.js). The flow of data distributes to endpoint(s) determined by the particular socket type.

```js
var source = require('fs').createReadStream('filename.ext');

source.pipe(socket); //sends each chunk as a msg to socket's particular endpoint
```

### socket.on('data', callback)
*(Function, param order: String, Function)*: The `Readable` stream's `on()` function is an event listener that emits `'data'` events. To receive messages, pass the string `'data'` followed a callback containing a single data parameter.

```js
// the default inbound message is a node buffer
// setEncoding sets the message type, use utf8 to receive strings instead.
socket.setEncoding('utf8');

socket.on('data', function (msg) {
  console.log(msg); //'hello from nanømsg!'
});
```

The readable stream's `data` event is automatically invoked when piped to a `Writable` or `Transform` consumer stream. See [example for more detail](examples/transforms.js). Here `msgprocessor` is a transform you could pipe to a writable or the next transform:

```js
var through = require('through');

var msgprocessor = through(function(msg){
  var str = msg; //'hello from nanømsg'
  this.queue(str + ' and cheers!');
});

socket.pipe(msgprocessor); //msg transformed to: 'hello from nanømsg and cheers!'
```

## subscription api

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

## sockopt api

### socket.tcpnodelay(boolean)

*(Function, param: Boolean, default: false)*: When set, disables Nagle’s algorithm. It also disables delaying of TCP acknowledgments. Using this option improves latency at the expense of throughput.

Pass no parameter for current tcp nodelay setting.

```js
//default
console.log(socket.tcpnodelay()); //tcp nodelay: off

socket.tcpnodelay(true); //disabling Nagle's algorithm

console.log(socket.tcpnodelay()); //tcp nodelay: on
```

### socket.maxttl(hops)

*(Function, param: Number, default: `8`)*: Sets the maximum number of "hops" a
message can go through before it is dropped. Each time the message is received
(for example via the `nn_device(3)` function) counts as a single hop. This
provides a form of protection against inadvertent loops.

Pass no parameter for the socket's maxttl hop count.

```js
socket.maxttl(4);
console.log(socket.maxttl()); // 4
```

### socket.linger(duration)

*(Function, param: Number, default: `1000`)*: Specifies how long the socket should try to send pending outbound messages after `socket.close()` or `socket.shutdown()` is called, in milliseconds.

Pass no parameter for the linger duration.

Note: linger was deprecated upstream.  As of node-nanomsge > v3.3.0 (libnanomsg 1.1.0), this value no longer has any meaning, and will always read back 0.

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

### socket.rcvmaxsize(size)

*(Function, param: Number, size in bytes, default: `1024kB`)*: Maximum message size that can be received, in bytes. Negative value means that the received size is limited only by available addressable memory.

Pass no parameter for the socket's maximum receive buffer size.

```js
socket.rcvmaxsize(10000000);
console.log(socket.rcvmaxsize()); // 10000000
```

### socket.wsopt(str)

*(Function, param: String, Websocket msg frame format, default: `'binary'`)*: This option may be set to type `'text'` or `'binary'`. This string value determines whether data msgs are sent as WebSocket *text frames*, or *binary frames*, per RFC 6455. Text frames should contain only valid UTF-8 text in their payload, or they will be rejected. Binary frames may contain any data. Not all WebSocket implementations support binary frames. The default is to send binary frames.

Pass no parameter for the socket's frame format.

```js
socket.wsopt('text');
console.log(socket.wsopt()); // 'text'
```

If you are implementing nanomsg websockets in the browser, please carefully review the spec: https://raw.githubusercontent.com/nanomsg/nanomsg/master/rfc/sp-websocket-mapping-01.txt

### socket.dontwait(boolean)

*(Function, param: Boolean, default: `true`, except PUSH sockets)*: Sets the NN_DONTWAIT flag, specifying that the operation should be performed in non-blocking mode,

* `true` for non-blocking mode
* `false` for blocking mode

Pass no parameter for the socket's current mode.

```js
socket.dontwait(false);
console.log(socket.dontwait()); // false

// or set when socket is started:
require('nanomsg').socket('pub', { dontwait: false });
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

# test - when node-nanomsg is being installed the optional way (dynamically linking to libnanomsg)

```bash
# you can build the project and run the test suite:
$ make use_system_libnanomsg && make check

# or perhaps you'd prefer to use the npm commands instead:
$ npm i --use_system_libnanomsg=true
$ npm t

# let's say you switch to another version of node/iojs, you might want to run:
$ make clean && make use_system_libnanomsg && make check

# for the super deluxe make clean, rebuild, and test suite:
$ make use_system_libnanomsg-full
```

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

## contributors

<table><tbody>
<tr><th align="left">a0000778</th><td><a href="https://github.com/a0000778">GitHub/a0000778</a></td><td>-</td></tr>
<tr><th align="left">Ant Skelton</th><td><a href="https://github.com/blowback">GitHub/blowback</a></td><td>-</td></tr>
<tr><th align="left">Adam Biro</th><td><a href="https://github.com/sirudog">GitHub/sirudog</a></td><td>-</td></tr>
<tr><th align="left">Benjamin Byholm</th><td><a href="https://github.com/kkoopa">GitHub/kkoopa</a></td><td>-</td></tr>
<tr><th align="left">Bent Cardan</th><td><a href="https://github.com/reqshark/">GitHub/reqshark</a></td><td><a href="http://twitter.com/rekshark">Twitter/@rekshark</a></td></tr>
<tr><th align="left">Deepak Prabhakara</th><td><a href="https://github.com/deepakprabhakara/">GitHub/deepakprabhakara</a></td><td><a href="http://twitter.com/deepakprab">Twitter/@deepakprab</a></td></tr>
<tr><th align="left">Flynn Joffray</th><td><a href="https://github.com/nucleardreamer/">GitHub/nucleardreamer</a></td><td><a href="http://twitter.com/nucleardreamer">Twitter/@nucleardreamer</a></td></tr>
<tr><th align="left">m-ohuchi</th><td><a href="https://github.com/m-ohuchi">GitHub/m-ohuchi</a></td><td>-</td></tr>
<tr><th align="left">Michele Comignano</th><td><a href="https://github.com/comick">GitHub/comick</a></td><td>-</td></tr>
<tr><th align="left">Nick Desaulniers</th><td><a href="https://github.com/nickdesaulniers">GitHub/nickdesaulniers</a></td><td><a href="http://twitter.com/LostOracle">Twitter/@LostOracle</a></td></tr>
<tr><th align="left">Tim Cameron Ryan</th><td><a href="https://github.com/tcr">GitHub/tcr</a></td><td><a href="http://twitter.com/timcameronryan">Twitter/@timcameronryan</a></td></tr>
<tr><th align="left">Trygve Lie</th><td><a href="https://github.com/trygve-lie">GitHub/trygve-lie</a></td><td><a href="http://twitter.com/trygve_lie">Twitter/@trygve_lie</a></td></tr>
</tbody></table>

## formatting

### C/C++
Please run `clang-format -style=Mozilla -i <file>` on all C/C++ code.

### JS
WIP

## license

MIT

## memory leak hunting
`npm i --asan=true`
