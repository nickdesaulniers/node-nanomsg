// do an async connect before sending msg
var nano = require('..');
var pub = nano.socket('pub');
var sub = nano.socket('sub');
var addr = 'tcp://127.0.0.1:7789'
pub.bind(addr);
sub.pipe(process.stdout);
var anotherRet = sub.connect(addr, function (ret) {
  if (ret) pub.send('hello from nanomsg stream api\n');
});
