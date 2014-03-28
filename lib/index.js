var nn = require('bindings')('node_nanomsg.node');

var util = require('util');
var EventEmitter = require('events').EventEmitter;


function Socket (type, binding, sender, receiver) {
	this.type = type;
	this.binding = binding;
	this.queue = [];

	this.mask = (sender ? nn.NN_POLLOUT : 0) | (receiver ? nn.NN_POLLIN : 0);
	this._listen(this._poll.bind(this));
}

util.inherits(Socket, EventEmitter);

Socket.prototype._protect = function (ret, unwind) {
	if (ret < 0) {
		unwind && unwind.call(this);
		this.emit('error', new Error(nn.Strerr(nn.Errno())));
		return null;
	}
	return ret;
};

Socket.prototype._poll = function (revents) {
	if (revents & nn.NN_POLLIN) {
		this._receive();
	}
	if (revents & nn.NN_POLLOUT) {
		this.flush();
	}
}

Socket.prototype._send = function (buf, flags) {
	if (this.type == 'surveyor') {
		this.mask = nn.NN_POLLOUT | nn.NN_POLLIN;
	}
	this._protect(nn.Send(this.binding, buf, flags), function () {
		this.queue.unshift(buf);
	});
}

Socket.prototype._receive = function () {
	var msg = nn.Recv(this.binding, 0);
	if (this.type == 'surveyor') {
		if (msg < 0 && nn.Errno() == nn.EFSM) {
			this.mask = nn.NN_POLLOUT;
			this.emit('survey-timeout');
			return;
		}
	}
	this.emit('message', msg);
}

Socket.prototype._listen = function (cb) {
	var self = this;
	self._timer = setImmediate(function loop () {
		if (self.closed) return;
		var mask = self.mask;
		nn.NodeWorker(self.binding, mask, function (err, revents) {
			if (err) self.emit('error', new Error(nn.Strerr(err)));
			if (revents & mask) {
				cb(revents);
			}
			self._timer = setImmediate(loop);
		})
	});
}


/**
 * Socket API
 */

Socket.prototype.bind = function (addr) {
	this._protect(nn.Bind(this.binding, addr));
}

Socket.prototype.connect = function (addr) {
	this._protect(nn.Connect(this.binding, addr));
}

Socket.prototype.flush = function () {
	while (this.queue.length) {
		var entry = this.queue.shift();
		this._send(entry[0], Number(entry[1]) || 0);
	}
};

Socket.prototype.close = function () {
	if (!this.closed) {
		nn.Close(this.binding);
	}
	this.closed = true;
}

Socket.prototype.send = function (buf, flags) {
	if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
	this.queue.push([buf, flags]);
}


/**
 * module API
 */

function createSocket (type) {
	switch (type) {
	case 'req': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_REQ), true, true);
	case 'rep': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_REP), true, true);
	case 'pair': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PAIR), true, true);
	case 'push': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PUSH), true, false);
	case 'pull': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PULL), false, true);
	case 'pub': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_PUB), true, false);
	case 'sub': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_SUB), false, true);
	case 'bus': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_BUS), true, true);
	case 'surveyor': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_SURVEYOR), true, false);
	case 'respondent': return new Socket(type, nn.Socket(nn.AF_SP, nn.NN_RESPONDENT), true, true);
	}
	throw new Error('Unknown socket type ' + type);
}


exports._bindings = nn;
exports.Socket = Socket;
exports.createSocket = createSocket;
exports.socket = createSocket;