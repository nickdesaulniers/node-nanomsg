'use strict';

var nano = require('../');
var assert = require('assert');

if (process.argv.length != 5) {
    console.log('usage: node local_lat.js <bind-to> <msg-size> <roundtrips>');
    process.exit(1);
}
var bind_to = process.argv[2];
var sz = Number(process.argv[3]);
var rts = Number(process.argv[4]);

var s = nano.socket('pair');
assert(s.binding !== -1);
var rc = s.tcpnodelay(true);
assert(rc === true);
rc = s.bind(bind_to);
assert(rc >= 0);

var i = 0;
s.on('data', function (data) {
    assert.equal(data.length, sz);
    var nbytes = s.send(data);
    assert.equal(nbytes, sz);
    if (++i === rts) {
        s.flush();
        s.close();
    }
});
