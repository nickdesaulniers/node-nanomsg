var nano = require('..');
var pub = nano.socket('pub');
var sub = nano.socket('sub');

var addr = 'tcp://127.0.0.1:7789'
pub.bind(addr);
sub.connect(addr);

sub.pipe(process.stdout);
setInterval( send, 100 );

function send(){
  pub.send('hello from nanomsg stream api\n');
}
