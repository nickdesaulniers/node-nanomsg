var nn = require('bindings')('node_nanomsg.node');

var util = require('util');
var EventEmitter = require('events').EventEmitter;


/**
 * Socket implementation
 */
function Socket (domain, type) {
    // DO NOT attempt to rename to this.domain, unless you like EventEmitter pain!
    this.af_domain = domain;
    this.type = type;

    if((domain != nn.AF_SP) && (domain != nn.AF_SP_RAW)) {
        throw new Error('unrecognised socket domain');
    }

    switch(type) {
        case 'req':
            this.protocol = nn.NN_REQ;
            this.sender=true;
            this.receiver=true; 
            break;

        case 'rep':
            this.protocol = nn.NN_REP;
            this.sender = true;
            this.receiver = true;
            break;

        case 'pair':
            this.protocol = nn.NN_PAIR;
            this.sender = true;
            this.receiver = true;
            break;

        case 'push':
            this.protocol = nn.NN_PUSH;
            this.sender = true;
            this.receiver = false;
            break;

        case 'pull':
            this.protocol = nn.NN_PULL;
            this.sender = false;
            this.receiver = true;
            break;

        case 'pub':
            this.protocol = nn.NN_PUB;
            this.sender = true;
            this.receiver = false;
            break;

        case 'sub':
            this.protocol = nn.NN_SUB;
            this.sender = false;
            this.receiver = true;
            break;

        case 'bus':
            this.protocol = nn.NN_BUS;
            this.sender = true;
            this.receiver = true;
            break;

        case 'surveyor':
            this.protocol = nn.NN_SURVEYOR;
            this.sender = true;
            this.receiver = false;
            break;

        case 'respondent':
            this.protocol = nn.NN_RESPONDENT;
            this.sender = true;
            this.receiver = true;
            break;

        default:
            throw new Error('unrecognised socket type ' + type);
            break;
    }

    this.binding = nn.Socket(this.af_domain, this.protocol);
    this.queue = [];

    this.mask = (this.sender ? nn.NN_POLLOUT : 0) | (this.receiver ? nn.NN_POLLIN : 0);

    if(this.af_domain == nn.AF_SP) {
        this._listen(this._poll.bind(this));
    }
}

util.inherits(Socket, EventEmitter);

Socket.prototype._protect = function (ret, unwind) {
    if(ret < 0) {
        unwind && unwind.call(this);
        this.emit('error', new Error(nn.Strerr(nn.Errno())));
        return null;
    }
    return ret;
};

/* like _protect, but ret is an array where the first element
 * is the error code (0=good, <0=bad), and the second element
 * is the value to return if there was no error.
 */
Socket.prototype._protectArray = function (ret, unwind) {
    if(ret[0] < 0) {
        unwind && unwind.call(this);
        this.emit('error', new Error(nn.Strerr(nn.Errno())));
        return null;
    }
    return ret[1];
};

Socket.prototype._poll = function (revents) {
    if(revents & nn.NN_POLLIN) {
        this._receive();
    }
    if(revents & nn.NN_POLLOUT) {
        this.flush();
    }
};

Socket.prototype._send = function (buf, flags) {
    if(this.type == 'surveyor') {
        this.mask = nn.NN_POLLOUT | nn.NN_POLLIN;
    }

    if (this.transform) buf = this.transform(buf);
    if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
    return this._protect(nn.Send(this.binding, buf, flags), function () {
        this.queue.unshift(buf);
    });
};

Socket.prototype._receive = function () {
    var msg = nn.Recv(this.binding, 0);

    if(this.type == 'surveyor') {
        if(msg < 0 && nn.Errno() == nn.EFSM) {
            this.mask = nn.NN_POLLOUT;
            this.emit('survey-timeout');
            return;
        }
    }
    if (this.restore) msg = this.restore(msg);
    this.emit('message', msg);
};

Socket.prototype._listen = function (cb) {
    var self = this;
    self._timer = setImmediate(function loop () {
        if(self.closed) {
            return;
        }

        var mask = self.mask;
        nn.NodeWorker(self.binding, mask, function (err, revents) {

            if(err) {
                self.emit('error', new Error(nn.Strerr(err)));
            }

            if(revents & mask) {
                cb(revents);
            }

            self._timer = setImmediate(loop);
        })
    });
};

/**
 * Socket API
 */

Socket.prototype.bind = function (addr) {
    return this._protect(nn.Bind(this.binding, addr));
}

Socket.prototype.connect = function (addr) {
    return this._protect(nn.Connect(this.binding, addr));
}

Socket.prototype.flush = function () {
    while(this.queue.length) {
        var entry = this.queue.shift();
        this._send(entry[0], Number(entry[1]) || 0);
    }
};

Socket.prototype.close = function () {
    if(!this.closed) {
        this.closed_status = nn.Close(this.binding);
        this.closed = true;
        return this.closed_status;
    }

    // TODO: AJS: in the event of multiple close, we remember
    // the return code from the first valid close, and return
    // it for all subsequent close attempts. This appears to be
    // in the spirit of the original author's intention, but
    // perhaps it would be better to return EBADF or some other
    // error?
    return this.closed_status;
};

Socket.prototype.send = function (buf, flags) {
    this.queue.push([buf, flags]);

    return buf.length;
};

/* returns an int, a string, or throws EBADF, ENOPROTOOPT, ETERM */
Socket.prototype.getsockopt = function (level, option) {
    return this._protectArray(nn.Getsockopt(this.binding, level, option));
};

Socket.prototype.setsockopt = function (level, option, value) {
    return this._protect(nn.Setsockopt(this.binding, level, option, value));
};

Socket.prototype.shutdown = function (how) {
    return this._protect(nn.Shutdown(this.binding, how));
};

/**
 * Type-specific API
 */
Socket.prototype.survey = function (buf, callback) {
    if (!this.type == 'surveyor') {
        throw new Error('Only surveyor sockets can survey.');
    }
    var responses = [];
    function listener (buf) {
        responses.push(buf);
    }
    this.once('survey-timeout', function () {
        this.removeListener('message', listener);
        callback(responses);
    })
    this.on('message', listener)
    this.send(buf);
}


/**
 * Device implementation
 */
function Device (sock1,sock2) {
    var that = this;
    this.sock1= sock1;
    this.sock2 = sock2;
    this.s1 = -1;
    this.s2 = -1;

    if(sock1 instanceof Socket) {
        this.s1 = sock1.binding;

        if(sock2 instanceof Socket) {
            this.s2 = sock2.binding;
        }

        this._timer = setImmediate(function () {
            nn.DeviceWorker(that.s1, that.s2, function (err) {
                that.emit('error', new Error(nn.Strerr(err)));
            });
        });

    } else {
        throw new Error('expected at least one Socket argument');
    }
}

util.inherits(Device, EventEmitter);

/**
 * module API
 */
function createSocket (type, opts) {
    var domain = (opts || {}).raw ? nn.AF_SP_RAW : nn.AF_SP;
    return new Socket(domain, type);
}

function symbolInfo (symbol) {
    return nn.SymbolInfo(symbol);
}

function symbol (symbol) {
    return nn.Symbol(symbol);
}

function term () {
    return nn.Term();
}

function createDevice (sock1, sock2) {
    return new Device(sock1, sock2);
}

exports._bindings = nn;
exports.Socket = Socket;
exports.createSocket = createSocket;
exports.symbolInfo = symbolInfo;
exports.symbol = symbol;
exports.term = term;
exports.socket = createSocket;

exports.createDevice = createDevice;
exports.device = createDevice;
