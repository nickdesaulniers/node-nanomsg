var nn = require('bindings')('node_nanomsg.node')
  , pub = nn.Socket(nn.AF_SP, nn.NN_PUB)
  , sub = nn.Socket(nn.AF_SP, nn.NN_SUB);

nn.Bind(pub,    "tcp://127.0.0.1:7789");
nn.Connect(sub, "tcp://127.0.0.1:7789");
nn.Usleep(40000); // 4 ms

// setTimeout(function () {
	nn.Send(pub, new Buffer("Hello from nanomsg!"), 0);

console.log('receiving');
var now = nn.Recv(sub, 0);
console.log('result', now.toString());
if (now == -1) {
	console.log(nn.Errno())
	console.log(nn.Strerr(nn.Errno()))
}
// }, 1000);/