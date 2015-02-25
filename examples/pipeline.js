var nano = require('..');

var pull = nano.socket('pull', {encoding:'utf8'} );
var push = nano.socket('push');

var addr = 'tcp://127.0.0.1:7789';
pull.connect(addr);
push.bind(addr);

pull.on('data', console.log);

setInterval( send, 100 );

function send(){
	push.send('hello from nanomsg stream api');
}
