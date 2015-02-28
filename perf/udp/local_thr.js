'use strict';

var assert = require('assert');

if (process.argv.length != 5) {
    console.log('usage: node local_thr.js <bind-to> <msg-size> <msg-count>');
    process.exit(1);
}

var bind_to = process.argv[2].split('//')[1].split(':');
var sz = Number(process.argv[3]);
var count = Number(process.argv[4]);

var s = require('dgram').createSocket('udp4');
var sw, i = 0;
s.bind(bind_to[1]);
s.on('message', handler);

function handler(data) {
    assert(data.length === sz);
    if (!sw) sw = process.hrtime();
    if (++i === count) finish();
}

function finish() {
    sw = process.hrtime(sw);
    var total = sw[0] + (sw[1] / 1e9);
    var thr = count / total;
    var mbs = (thr * sz * 8) / 1000000;
    console.log('message size: %d [B]', sz);
    console.log('message count: %d', count);
    console.log('throughput: %d [msg/s]', thr.toFixed(0));
    console.log('throughput: %d [Mb/s]', mbs.toFixed(3));
    s.close(); process.exit(0);
}
