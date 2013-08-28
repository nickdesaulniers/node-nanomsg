# Node-NanoMSG
Node.js binding for [nanomsg](http://nanomsg.org/index.html).

## Usage

`npm install nanomsg`

```javascript
var nanomsg = require('nanomsg');
var assert = require('assert');
var AF_SP = nanomsg.AF_SP;
var NN_PAIR = nanomsg.NN_PAIR;
var msg = new Buffer('hello');
var recv = new Buffer(msg.length);
var s1, s2, ret;

s1 = nanomsg.nn_socket(AF_SP, NN_PAIR);
assert(s1 >= 0, 's1: ' + nanomsg.nn_errno());

ret = nanomsg.nn_bind(s1, 'inproc://a');
assert(ret > 0, 'bind');

s2 = nanomsg.nn_socket(AF_SP, NN_PAIR);
assert(s2 >= 0, 's2: ' + nanomsg.nn_errno());

ret = nanomsg.nn_connect(s2, 'inproc://a');
assert(ret > 0, 'connect');

ret = nanomsg.nn_send(s2, msg, msg.length, 0);
assert(ret > 0, 'send');

ret = nanomsg.nn_recv(s1, recv, recv.length, 0);
assert(ret > 0, 'recv');

assert(msg.toString() === recv.toString(), "didn't receive sent message");
console.log(recv.toString());
```

