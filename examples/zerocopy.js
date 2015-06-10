var nano = require('..');
var pub = nano.socket('pub');
var sub = nano.socket('sub');
var buf = Buffer('hello from nanomsg!');

pub.bind('tcp://127.0.0.1:55555');
sub.connect('tcp://127.0.0.1:55555');
sub.on('message', function(msg){ console.log(String(msg)) });

setInterval(send, 100);
function send(){
  return pub.zerocopySend(buf);
}
