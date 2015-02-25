var nano = require('..')
var pub   = nano.socket('pub'),       push  = nano.socket('push');
var sub   = nano.socket('sub'),       pull  = nano.socket('pull');
pub.bind('tcp://127.0.0.1:3333');     push.bind('tcp://127.0.0.1:4444');
sub.connect('tcp://127.0.0.1:3333');  pull.connect('tcp://127.0.0.1:4444');

// setEncoding formats inbound message type
sub.setEncoding('utf8');

sub.on('data', function (msg) {
  console.log(msg); //hello from a push socket!
})

pull.pipe(pub); //pipe readable sockets to any writable socket or stream

setInterval( function(){ push.send('hello from a push socket!') }, 100 );
