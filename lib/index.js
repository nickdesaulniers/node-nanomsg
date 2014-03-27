var nn = require('bindings')('node_nanomsg.node');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Socket (type, binding, sender, receiver) {
	this.type = type;
	this.binding = binding;

	var self = this;
	var mask = (sender ? nn.NN_POLLOUT : 0) | (receiver ? nn.NN_POLLIN : 0);
	if (mask) {
		this._listen(mask, function (revents) {
			if (revents & nn.NN_POLLIN) {
				self.emit('message', nn.Recv(self.binding, 0));
			}
			if (revents & nn.NN_POLLOUT) {
				self.flush();
			}
			return true;
		});
	}
}

util.inherits(Socket, EventEmitter);

Socket.prototype.bind = function (addr) {
	var ret = nn.Bind(this.binding, addr);
	return ret;
}

Socket.prototype.connect = function (addr) {
	var ret = nn.Connect(this.binding, addr);
	return ret;
}

Socket.prototype._listen = function (mask, cb) {
	var self = this;
	self._timer = setImmediate(function loop () {
		if (self.closed) return;
		nn.NodeWorker(self.binding, mask, function (err, revents) {
			if (err) throw new Error(nn.Strerr(err));
			if (revents & mask) {
				if (cb(revents))
					self.timer = setImmediate(loop);
			} else {
				self.timer = setImmediate(loop);
			}
		})
	});
}

Socket.prototype.flush = function () {
};

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
	case 'req': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_REQ));
	case 'rep': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_REP));
	case 'pair': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PAIR));
	case 'push': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PUSH), true, false);
	case 'pull': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PULL), false, true);
	case 'pub': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PUB), true, false);
	case 'sub': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_SUB), false, true);
	case 'bus': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_BUS));
	}
	throw new Error('Unknown socket type ' + type);
}


exports._bindings = nn;
exports.Socket = Socket;
exports.createSocket = createSocket;
exports.socket = createSocket;