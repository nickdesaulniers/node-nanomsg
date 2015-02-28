'use strict';

var net         = require('net');
var assert      = require('assert');
var sw, i       = 0;

if (process.argv.length != 5) {
    console.log('usage: node remote_lat.js <connect-to> <msg-size> <roundtrips>');
    process.exit(1);
}
var connect_to  = process.argv[2].split('//')[1].split(':');
var sz          = Number(process.argv[3]);
var rts         = Number(process.argv[4]);
var buf         = new Buffer(sz); buf.fill('o');
var s           = new net.Socket({setNoDelay: true});


setTimeout(function(){
  sw = process.hrtime();
  s.connect(connect_to[1], function() {
    s.write(buf);
  });
},500);

s.on('data', send );
s.on('error', e );

function send (data) {
  assert.equal(data.length, sz);
  s.write(buf);
  if (++i == rts)
    return finish();
}
function finish() {
  sw = process.hrtime(sw);
  var total = sw[0] * 1e6 + sw[1] / 1e3;
  var lat = total / (rts * 2);
  console.log('message size: %d [B]', sz);
  console.log('roundtrip count: %d', rts);
  console.log('average latency: %d [us]', lat.toFixed(3));

  s.unref();
}

function e (er){ require('util').log(er) }
