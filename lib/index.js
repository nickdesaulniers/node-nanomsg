var nn = require('bindings')('node_nanomsg.node');

var util = require('util');
var EventEmitter = require('events').EventEmitter;

function Socket (type, binding, sender, receiver) {
	this.type = type;
	this.binding = binding;
	this.queue = [];

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

Socket.prototype._protect = function (ret, unwind) {
	if (ret < 0) {
		unwind && unwind.call(this);
		this.emit('error', new Error(nn.Strerr(nn.Errno())));
	}
};

Socket.prototype.bind = function (addr) {
	this._protect(nn.Bind(this.binding, addr));
}

Socket.prototype.connect = function (addr) {
	this._protect(nn.Connect(this.binding, addr));
}

Socket.prototype._listen = function (mask, cb) {
	var self = this;
	self._timer = setImmediate(function loop () {
		if (self.closed) return;
		nn.NodeWorker(self.binding, mask, function (err, revents) {
			if (err) self.emit('error', new Error(nn.Strerr(err)));
			if (revents & mask) {
				if (cb(revents))
					self.timer = setImmediate(loop);
			} else {
				self.timer = setImmediate(loop);
			}
		})
	});
}

Socket.prototype.flush = function (flags) {
	flags = Number(flags) || 0;
	while (this.queue.length) {
		var entry = this.queue.shift();
		this._protect(nn.Send(this.binding, entry, flags), function () {
			this.queue.unshift(entry);
		});
	}
};

Socket.prototype.close = function () {
	if (!this.closed) {
		nn.Close(this.binding);
	}
	this.closed = true;
}

Socket.prototype.send = function (buf) {
	if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	this.queue.push(buf);
}

function createSocket (type) {
	switch (type) {
	case 'req': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_REQ), true, true);
	case 'rep': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_REP), true, true);
	case 'pair': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PAIR), true, true);
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