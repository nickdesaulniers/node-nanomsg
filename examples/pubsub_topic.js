var nano = require('../');

var pub = nano.socket('pub');
var sub = nano.socket('sub');

// FIXME: i don't like this, i will look another way to export constants, 
// pass constants like i think that is not right too.
var nn = nano._bindings;

var addr = 'tcp://127.0.0.1:7789'
pub.bind(addr);
sub.setsockopt(nn.NN_SUB, nn.NN_SUB_SUBSCRIBE, 'my.topic');
sub.connect(addr);

sub.on('message', function (buf) {
	console.log(buf.toString());
	pub.close();
	sub.close();
});

setTimeout(function () {
	pub.send("Hello from nanomsg!");
	pub.send('my.topic my message');
}, 100);