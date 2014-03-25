var nn = require('bindings')('node_nanomsg.node')
  , pub = nn.Socket(nn.AF_SP, nn.NN_PUB)
  , sub = nn.Socket(nn.AF_SP, nn.NN_SUB);

nn.Bind(pub,    "tcp://127.0.0.1:7789");
nn.Connect(sub, "tcp://127.0.0.1:7789");

// setTimeout(function () {

nn.NodeWorker(sub, nn.NN_POLLIN, function loop (err, revents) {
	if (err) throw new Error(nn.Strerr(err));
	if (revents & nn.NN_POLLIN) {
		console.log(nn.Recv(sub, 0).toString());
	}
})

setTimeout(function () {
	nn.Send(pub, new Buffer("Hello from nanomsg!"), 0);
}, 500);
// console.log('receiving');
// var now = nn.Recv(sub, 0);
// console.log('result', now.toString());
// if (now == -1) {
// 	console.log(nn.Errno())
// 	console.log(nn.Strerr(nn.Errno()))
// }
// }, 1000);/