'use strict';

var net         = require('net');
var assert      = require('assert');

if (process.argv.length != 5) {
  require('util').log('usage: node remote_thr.js <bind-to> <msg-size> <msg-count>');
  process.exit(1);
}
var connect_to  = process.argv[2].split('//')[1].split(':');
var sz          = Number(process.argv[3]);
var count       = Number(process.argv[4])*1.1;
var buf         = new Buffer(sz), i = 0;
buf.fill('o');
assert(buf.length === sz);

var s = new net.Socket();
setTimeout(function(){
  s.connect(connect_to[1], function() {
    s.write(buf);
  });
}, 1000)

s.on('data', dataHandler );
s.on('error', e );

function dataHandler (data) {
  assert(data.length === sz);
  if(++i < count)
    return s.write(buf);
  return s.unref();
};

function e (er){ require('util').log(er) }

//net module API socket.bufferSize
//http://nodejs.org/api/net.html#net_socket_buffersize

//net.Socket has the property that socket.write() always works.
//This is to help users get up and running quickly.

//The computer cannot always keep up with the amount of data that is written
//to a socket - the network connection simply might be too slow. Node will
//internally queue up the data written to a socket and send it out over the wire
//when it is possible. (Internally it is polling on the socket's file descriptor
//for being writable).

//The consequence of this internal buffering is that memory may grow.
//This property shows the number of characters currently buffered to be written.
//(Number of characters is approximately equal to the number of bytes to be
//  written, but the buffer may contain strings, and the strings are lazily
//  encoded, so the exact number of bytes is not known.)

//Users who experience large or growing bufferSize should attempt to "throttle"
//the data flows in their program with pause() and resume().
