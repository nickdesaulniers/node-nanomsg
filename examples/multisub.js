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

sub1.on('message', function (buf) {
    console.log("sub1 got: %s", buf.toString());
});

sub2.on('message', function (buf) {
    console.log("sub2 got: %s", buf.toString());
});

sub3.on('message', function (buf) {
    console.log("sub3 got: %s", buf.toString());
});

setTimeout(function () {
    console.log("PUBLISHING...");
    pub.send("Hello from nanomsg!");
}, 100);

