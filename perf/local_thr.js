'use strict';

var nano = require('../');
var assert = require('assert');

if (process.argv.length != 5) {
    console.log('usage: node local_thr.js <bind-to> <msg-size> <msg-count>');
    process.exit(1);
}
var bind_to = process.argv[2];
var sz = Number(process.argv[3]);
var count = Number(process.argv[4]);

var s = nano.socket('pair');
assert(s.binding !== -1);
var rc = s.bind(bind_to);
assert(rc >= 0);

var sw;

function finish() {
    sw = process.hrtime(sw);
    var total = sw[0] + (sw[1] / 1e9);
    var thr = count / total;
    var mbs = (thr * sz * 8) / 1000000;
    console.log('message size: %d [B]', sz);
    console.log('message count: %d', count);
    console.log('throughput: %d [msg/s]', thr.toFixed(0));
    console.log('throughput: %d [Mb/s]', mbs.toFixed(3));
    rc = s.close();
    assert(rc === 0);
}

var i = 0;
s.on('data', function (data) {
    assert(data.length === sz);
    if (!sw) {
        sw = process.hrtime();
    }
    if (++i === count) {
        finish();
    }
});
