'use strict';

var dgram = require('dgram');
var assert = require('assert');

if (process.argv.length != 5) {
    require('util').log('usage: node remote_thr.js <bind-to> <msg-size> <msg-count>');
    process.exit(1);
}

var connect_to = process.argv[2].split('//')[1].split(':');
var sz = Number(process.argv[3]);
var count = Number(process.argv[4])*1.5;

var s = dgram.createSocket('udp4')
var buf = new Buffer(sz), i = 0;
buf.fill('o');

assert(buf.length === sz);

do s.send(buf, 0, sz, connect_to[1], connect_to[0]);
while(i++ < count);
s.unref();
