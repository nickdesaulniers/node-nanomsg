var nano = require('../');

var pull = nano.socket('pull');
var push = nano.socket('push');

var addr = 'tcp://127.0.0.1:7789'
pull.bind(addr);
push.connect(addr);

pull.on('message', function (buf) {
	console.log(buf.toString());
	pull.close();
	push.close();
});

setTimeout(function () {
	push.send("Hello from nanomsg!");
}, 100);