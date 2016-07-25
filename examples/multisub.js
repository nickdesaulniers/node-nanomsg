var nano = require('../');

var pub = nano.socket('pub');
var sub1 = nano.socket('sub');
var sub2 = nano.socket('sub');
var sub3 = nano.socket('sub');

var addr = 'tcp://127.0.0.1:7789'
pub.bind(addr);
sub1.connect(addr);
sub2.connect(addr);
sub3.connect(addr);

sub1.on('data', function (str) {
  console.log('sub1 got: %s', str);
  sub1.close();
});
sub2.on('data', function (str) {
  console.log('sub2 got: %s', str);
  sub2.close();
});
sub3.on('data', function (str) {
  console.log('sub3 got: %s', str);
  sub3.close();
});

setTimeout(function () {
  console.log("PUBLISHING...");
  pub.send("Hello from nanomsg!");
}, 100);
