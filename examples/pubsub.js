var nano = require('../');

var pub = nano.socket('pub');
var sub = nano.socket('sub');
var nn = nano._bindings;

var addr = 'tcp://127.0.0.1:7789'
pub.bind(addr);
sub.setsockopt(nn.NN_SUB, nn.NN_SUB_SUBSCRIBE, '');
sub.connect(addr);

sub.on('message', function (buf) {
	console.log(buf.toString());
	pub.close();
	sub.close();
});

setTimeout(function () {
	pub.send("Hello from nanomsg!");
}, 100);