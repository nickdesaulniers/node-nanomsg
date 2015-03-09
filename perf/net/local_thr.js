'use strict';

var net       = require('net');
var assert    = require('assert');

if (process.argv.length != 5) {
  console.log('usage: node local_thr.js <bind-to> <msg-size> <msg-count>');
  process.exit(1);
}
var bind_to   = process.argv[2].split('//')[1].split(':');
var sz        = Number(process.argv[3]);
var count     = Number(process.argv[4]);

var sw, i     = 0;
var s         = net.createServer(function(sock) {
  sock.pipe(sock)
  sock.on('data', dataHandler);
  sock.on('error', e );
});

s.listen(bind_to[1]);
s.on('error', e );

function dataHandler (data) {
  assert(data.length === sz);
  if (!sw) sw = process.hrtime();
  if (++i === count)
    return finish();
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
  s.unref();
}

setTimeout(function(){
  process.exit(0);
},9000)

function e (er){ require('util').log(er) }
