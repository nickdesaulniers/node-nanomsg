var nano = require('./index');

var pub = nano.socket('pub');
var sub = nano.socket('sub');

var addr = 'tcp://127.0.0.1:7789'
pub.bind(addr);
sub.connect(addr);

sub.on('message', function (buf) {
	console.log(buf.toString());
	pub.close();
	sub.close();
});

setTimeout(function () {
	pub.send("Hello from nanomsg!");
}, 100);

// console.log('receiving');
// var now = nn.Recv(sub, 0);
// console.log('result', now.toString());
// if (now == -1) {
// 	console.log(nn.Errno())
// 	console.log(nn.Strerr(nn.Errno()))
// }
// }, 1000);/