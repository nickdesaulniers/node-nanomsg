'use strict';

var nano = require('../');
var assert = require('assert');

if (process.argv.length != 5) {
    console.log('usage: remote_thr <bind-to> <msg-size> <msg-count>');
    process.exit(1);
}

var connect_to = process.argv[2];
var sz = Number(process.argv[3]);
var count = Number(process.argv[4]);

var s = nano.socket('pair');
assert(s.binding !== -1);
var rc = s.connect(connect_to);
assert(rc >= 0);

var buf = new Buffer(sz);
buf.fill('o');

for (var i = 0; i != count; i++) {
    var nbytes = s.send(buf);
    assert(nbytes === sz);
}

s.flush();
s.close();
