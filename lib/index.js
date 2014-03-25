var nn = require('bindings')('node_nanomsg.node');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Socket (type, binding) {
	this.type = type;
	this.binding = binding;
}

util.inherits(Socket, EventEmitter);

Socket.prototype.bind = function (addr) {
	var ret = nn.Bind(this.binding, addr);
	return ret;
}

Socket.prototype.connect = function (addr) {
	var ret = nn.Connect(this.binding, addr);
	var self = this;
	(function loop () {
		nn.NodeWorker(self.binding, nn.NN_POLLIN, function loop (err, revents) {
			if (err) throw new Error(nn.Strerr(err));
			if (revents & nn.NN_POLLIN) {
				self.emit('message', nn.Recv(self.binding, 0));
			}
		})
	})();
}

Socket.prototype.close = function () {
	if (!this.closed) {
		nn.Close(this.binding);
	}
	this.closed = true;
}

Socket.prototype.send = function (buf) {
	if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	return nn.Send(this.binding, buf, 0);
}

function createSocket (type) {
	switch (type) {
	case 'pub':
		return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PUB));
	case 'sub':
		return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_SUB));
	default:
		throw new Error('Unknown socket type ' + type);
	}
}


exports.createSocket = createSocket;
exports.socket = createSocket;