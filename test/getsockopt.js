//https://github.com/chuckremes/nn-core/blob/master/spec/nn_getsockopt_spec.rb

var assert = require('assert');
var should = require('should');
var nano = require('../');
var nn = nano._bindings;

var test = require('tape');


test('NN_LINGER returns a default value of 1000', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_LINGER);
    t.equal(rc, 1000);
    sock.close();
});

test('NN_SNDBUF returns a default value of 128KB', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDBUF);
    t.equal(rc, 131072);
    sock.close();
});

test('NN_RCVBUF returns a default value of 128KB', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_RCVBUF);
    t.equal(rc, 131072);
    sock.close();
});

test('NN_SNDTIMEO returns a default value of -1', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDTIMEO);
    t.equal(rc, -1);
    sock.close();
});

test('NN_RCVTIMEO returns a default value of -1', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_RCVTIMEO);
    t.equal(rc, -1);
    sock.close();
});

test('NN_RECONNECT_IVL returns a default value of 100', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_RECONNECT_IVL);
    t.equal(rc, 100);
    sock.close();
});

test('NN_RECONNECT_IVL_MAX returns a default value of 0', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_RECONNECT_IVL_MAX);
    t.equal(rc, 0);
    sock.close();
});

test('NN_SNDPRIO returns a default value of 8', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDPRIO);
    t.equal(rc, 8);
    sock.close();
});

test('getsockopt throws exception for unsupported socket level', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for unsupported socket level');
        t.equal(nn.Errno(), nn.ENOPROTOOPT);
        sock.close();
    });

    sock.getsockopt(999999, nn.NN_SNDPRIO);
});

test('getsockopt throws exception for unsupported socket option', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for unsupported socket option');
        t.equal(nn.Errno(), nn.ENOPROTOOPT);
        sock.close();
    });

    sock.getsockopt(nn.NN_SOL_SOCKET, 999999);
});


