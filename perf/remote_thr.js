'use strict';

var nano = require('../');
var assert = require('assert');
var createMsg = require('./common').createMsg;

if (process.argv.length < 5 || process.argv.length > 6) {
    console.log('usage: node remote_thr.js <bind-to> <msg-size> <msg-count> [--string|--buffer]');
    process.exit(1);
}

var connect_to = process.argv[2];
var sz = Number(process.argv[3]);
var count = Number(process.argv[4]);
// Specific to node-nanomsg.
var msgType = process.argv[5] || '--buffer';

var s = nano.socket('pair');
assert(s.binding !== -1);
var rc = s.connect(connect_to);
assert(rc >= 0);

var buf = createMsg(msgType, sz);

for (var i = 0; i != count; i++) {
    var nbytes = s.send(buf);
    assert(nbytes === sz);
}

s.flush();
s.close();
