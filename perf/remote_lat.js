'use strict';

var nano = require('../');
var assert = require('assert');

if (process.argv.length != 5) {
    console.log('usage: node remote_lat.js <connect-to> <msg-size> <roundtrips>');
    process.exit(1);
}
var connect_to = process.argv[2];
var sz = Number(process.argv[3]);
var rts = Number(process.argv[4]);

var s = nano.socket('pair');
assert(s.binding !== -1);
var rc = s.tcpnodelay(true);
assert(rc === true);
rc = s.connect(connect_to);
assert(rc >= 0);

var buf = new Buffer(sz);
buf.fill('o');

var sw;

function finish() {
    sw = process.hrtime(sw);
    var total = sw[0] * 1e6 + sw[1] / 1e3;
    var lat = total / (rts * 2);
    console.log('message size: %d [B]', sz);
    console.log('roundtrip count: %d', rts);
    console.log('average latency: %d [us]', lat.toFixed(3));
    s.close()
}

function send() {
    var nbytes = s.send(buf);
    assert.equal(nbytes, sz);
}

var i = 0;
s.on('message', function (data) {
    assert.equal(data.length, sz);
    if (++i === rts) {
        finish();
    } else {
        send();
    }
});

sw = process.hrtime();
send();