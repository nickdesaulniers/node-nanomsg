// https://github.com/chuckremes/nn-core/blob/master/spec/nn_bind_spec.rb

var assert = require('assert');
var should = require('should');
var nano = require('../');
var nn = nano._bindings;

var test = require('tape');


test('bind returns non-zero endpoint number for valid INPROC address', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.bind('inproc://some_address');
    if(rc < 0) {
        t.fail('INPROC endpoint number invalid');
    } else {
        t.pass('INPROC endpoint number valid');
    }
    sock.close();
});

test('bind returns non-zero endpoint number for valid IPC address', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.bind('ipc:///tmp/some_address.ipc');
    if(rc < 0) {
        t.fail('IPC endpoint number invalid');
    } else {
        t.pass('IPC endpoint number valid');
    }
    sock.close();
});

test('bind returns non-zero endpoint number for valid TCP address', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.bind('tcp://127.0.0.1:5555');
    if(rc < 0) {
        t.fail('TCP endpoint number invalid');
    } else {
        t.pass('TCP endpoint number valid');
    }
    sock.close();
});

test('bind throws for invalid INPROC address', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for invalid INPROC address (missing slash)');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.bind('inproc:/missing_first_slash');
});

test('bind throws for invalid INPROC address (too long)', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for invalid INPROC address (too long)');
        t.equal(nn.Errno(), nn.ENAMETOOLONG);
        sock.close();
    });

    var addr = new Array(nn.NN_SOCKADDR_MAX + 1).join('a');
    sock.bind('inproc://' + addr);
});

test('bind throws for invalid IPC address', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for invalid IPC address');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.bind('ipc:/missing_first_slash');
});

test('bind throws for invalid TCP address (missing address)', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for missing TCP address');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.bind('tcp://');
});

test('bind throws for invalid TCP address (non-numeric port)', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for TCP non-numeric port');
    t.equal(nn.Errno(), nn.EINVAL);
    sock.close();
    });

    sock.bind('tcp://127.0.0.1:port');
});

test('bind throws for invalid TCP address (port out of range)', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for invalid TCP port');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.bind('tcp://127.0.0.1:65536');
});

test('bind throws for unsupported transport', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for unsupported transport');
        t.equal(nn.Errno(), nn.EPROTONOSUPPORT);
        sock.close();
    });

    sock.bind('zmq://127.0.0.1:6000');
});

test('bind throws for TCP on non-existent device', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'error thrown on non-existent TCP device');
        t.equal(nn.Errno(), nn.ENODEV);
        sock.close();
    });

    sock.bind('tcp://eth99:555');
});

test('bind throws for INPROC rebind to existing endpoint', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var sock2 = nano.socket('pub');
    var addr ='inproc://some_endpoint';

    sock2.on('error', function(err) {
        t.ok(err, 'error thrown on INPROC multiple binds');
        t.equal(nn.Errno(), nn.EADDRINUSE);
        sock.close();
        sock2.close();
    });

    sock.bind(addr);
    sock2.bind(addr);
});


