'use strict';

var nano = require('../');
var assert = require('assert');
var createMsg = require('./common').createMsg;

if (process.argv.length < 5 || process.argv.length > 6) {
    console.log('usage: node remote_lat.js <connect-to> <msg-size> <roundtrips> [--buffer|--string]');
    process.exit(1);
}
var connect_to = process.argv[2];
var sz = Number(process.argv[3]);
var rts = Number(process.argv[4]);
// Specific to node-nanomsg.
var msgType = process.argv[5] || '--buffer';

var s = nano.socket('pair');
assert(s.binding !== -1);
var rc = s.tcpnodelay(true);
assert(rc === true);
rc = s.connect(connect_to);
assert(rc >= 0);

var buf = createMsg(msgType, sz)

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
s.on('data', function (data) {
    assert.equal(data.length, sz);
    if (++i === rts) {
        finish();
    } else {
        send();
    }
});

sw = process.hrtime();
send();
