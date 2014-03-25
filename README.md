# node-libdtrace-async

node-libdtrace-async is a Node.js add-on that interfaces to libdtrace, allowing
Node programs to control DTrace enablings.  The implementation and documentation
are heavily based on
[node-libdtrace](https://github.com/bcantrill/node-libdtrace).

This module should still be considered a prototype.  The interface is subject to
change, and there may be stability issues.


## Installation

    $ npm install joyent/node-libdtrace-async

## Synopsis

Here's "hello, world", using
[vasync](https://github.com/davepacheco/node-vasync) to manage the asynchrony:

```javascript
var lda = require('dtrace-async');
var vasync = require('vasync');
var prog = 'BEGIN{ trace("hello, world"); }';
var consumer;
vasync.pipeline({
    'funcs': [
	function setup(_, callback) {
		consumer = lda.createConsumer();
		console.log('dtrace version: ', consumer.version());
		consumer.on('ready', callback);
	},
	function compile(_, callback) {
		console.log('consumer ready, compiling');
		consumer.strcompile(prog, callback);
	},
	function enable(_, callback) {
		console.log('compiled, enabling');
		consumer.go(callback);
	},
	function consume(_, callback) {
		console.log('enabled, consuming');
		consumer.consume(function (probe, value) {
			if (!value)
				return;
			console.log('consume: ', value.data);
		});
		consumer.stop(callback);
	}
    ]
}, function (err) {
	if (err)
		throw (err);
	console.log('stopped');
});
```

If you want a more concise, synchronous interface, see the original
node-libdtrace.  See below for the differences between this version and the
original.


## API

### `createConsumer()`

Create a new libdtrace consumer, which will correspond to a new `libdtrace`
state.  `createConsumer` returns a Consumer object, but it will not be ready for
use until it emits the `ready` event.

If DTrace cannot be initalized for any reason, an `error` event will be emitted
instead of `ready`.  One particularly common failure mode is attempting to
initialize DTrace without the necessary level of privilege; in this case, for
example, the `message` will be something like:

      DTrace requires additional privileges

If you hit this, you will need to be a user that has DTrace privileges.

### `consumer.strcompile(str, callback)`

Compile the specified `str` as a D program and invoke `callback` when that
completes.  This is required before any call to `consumer.go()`.

See "Liveness" below.

### `consumer.go(callback)`

Instruments the system using the specified enabling.  Before `consumer.go()`
is called, the specified D program has been compiled but not executed; once
`consumer.go()` is called, no further D compilation is possible.  `callback` is
invoked when the instrumentation has been enabled.

See "Liveness" below.

### `consumer.stop(callback)`

Disables instrumentation and frees resources associated with this consumer.
After calling this function, you cannot call `strcompile`, `go`, or `stop`
again on this consumer.  `callback` is invoked when the operation completes.

See "Liveness" below.

### `consumer.setopt(option, value)`

Sets the specified `option` (a string) to `value` (an integer, boolean,
string, or string representation of an integer or boolean, as denoted by
the option being set).

### `consumer.consume(function func (probe, rec) {})`

Consume any DTrace data traced to the principal buffer since the last call to
`consumer.consume()` (or the call to `consumer.go()` if `consumer.consume()`
has not been called).  For each trace record, `func` will be called and
passed two arguments:

* `probe` is an object that specifies the probe that corresponds to the
   trace record in terms of the probe tuple: provider, module, function
   and name.

* `rec` is an object that has a single member, `data`, that corresponds to
   the datum within the trace record.  If the trace record has been entirely
   consumed, `rec` will be `undefined`.

In terms of implementation, a call to `consumer.consume()` will result in a
call to `dtrace_status()` and a principal buffer switch.  Note that if the
rate of consumption exceeds the specified `switchrate` (set via either
`#pragma D option switchrate` or `consumer.setopt()`), this will result in no
new data processing.

This function is synchronous.  (`func` will be invoked during the call to
`consume`, not some time later.)

### `consumer.aggwalk(function func (varid, key, value) {})`

Snapshot and iterate over all aggregation data accumulated since the
last call to `consumer.aggwalk()` (or the call to `consumer.go()` if
`consumer.aggwalk()` has not been called).  For each aggregate record,
`func` will be called and passed three arguments:

* `varid` is the identifier of the aggregation variable.  These IDs are
  assigned in program order, starting with 1.

* `key` is an array of keys that, taken with the variable identifier,
  uniquely specifies the aggregation record.

* `value` is the value of the aggregation record, the meaning of which
  depends on the aggregating action:

  * For `count()`, `sum()`, `max()` and `min()`, the value is the
    integer value of the aggregation action

  * For `avg()`, the value is the numeric value of the aggregating action

  * For `quantize()`, `lquantize()`, and `llquantize()`, the value is an array
    of 2-tuples denoting ranges and value: each element consists of a two
    element array denoting the range (minimum followed by maximum, both
    inclusive) and the value for that range.

Upon return from `consumer.aggwalk()`, the aggregation data for the specified
variable and key(s) is removed.

Note that the rate of `consumer.aggwalk()` actually consumes the aggregation
buffer is clamped by the `aggrate` option; if `consumer.aggwalk()` is called
more frequently than the specified rate, `consumer.aggwalk()` will not
induce any additional data processing.

`consumer.aggwalk()` does not iterate over aggregation data in any guaranteed
order, and may interleave aggregation variables and/or keys.

This function is synchronous.  (`func` will be invoked during the call to
`aggwalk`, not some time later.)

### `consumer.version()`

Returns the version string, as returned from `dtrace -V`.


## Liveness

`strcompile`, `go`, and `stop` can take tens to hundreds of milliseconds.  To
keep the Node program responsive, these are executed using the libuv thread
pool.  However, these operations are CPU-bound, and the thread pool is typically
limited to only a few threads, so it's not recommended to run a lot of
`strcompile`, `go`, and `stop` methods concurrently.  If you do, they'll queue
up and potentially starve network and filesystem operations.


## Differences from node-libdtrace

The `strcompile`, `go`, and `stop` methods are asynchronous, since they can take
tens to hundreds of milliseconds.

This implementation uses the prototype
[node-addon-layer](https://github.com/tjfontaine/node-addon-layer) to provide a
stable binary interface.

Internally, this implementation passes quantized values in a format closer to
what libdtrace uses, which makes it possible to experiment with more efficient
ways of transmitting and packing those values.  This isn't yet exposed to
consumers.


## Platforms

This should work on any platform that supports DTrace, and is known to work on
illumos (tested on SmartOS).


## TODO

* add automated tests for happy paths
* add automated tests for quantize(), lquantize(), llquantize() data
  representations
* add automated tests for invalid paths
* stress-test and check for memory leaks
* stress-test and check for liveness
* stress-test and check for stability issues (make sure stop() always does stop)
