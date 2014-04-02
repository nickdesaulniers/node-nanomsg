// https://github.com/chuckremes/nn-core/blob/master/spec/nn_setsockopt_spec.rb

var assert = require('assert');
var should = require('should');
var nano = require('../');
var nn = nano._bindings;

var test = require('tape');


test('NN_LINGER can be set to 1500', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var rc = sock.setsockopt(nn.NN_SOL_SOCKET, nn.NN_LINGER, 1500);
    t.equal(rc, 0);
    rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_LINGER);
    t.equal(rc, 1500);
    sock.close();
});

test('NN_SNDBUF can be set to 64KB', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var rc = sock.setsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDBUF, 65536);
    t.equal(rc, 0);
    rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDBUF);
    t.equal(rc, 65536);
    sock.close();
});

test('NN_RCVBUF can be set to 64KB', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var rc = sock.setsockopt(nn.NN_SOL_SOCKET, nn.NN_RCVBUF, 65536);
    t.equal(rc, 0);
    rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_RCVBUF);
    t.equal(rc, 65536);
    sock.close();
});

test('NN_SNDTIMEO can be set to 1000', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var rc = sock.setsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDTIMEO, 1000);
    t.equal(rc, 0);
    rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDTIMEO);
    t.equal(rc, 1000);
    sock.close();
});

test('NN_RCVTIMEO can be set to 1000', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var rc = sock.setsockopt(nn.NN_SOL_SOCKET, nn.NN_RCVTIMEO, 1000);
    t.equal(rc, 0);
    rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_RCVTIMEO);
    t.equal(rc, 1000);
    sock.close();
});

test('NN_RECONNECT_IVL can be set to 1000', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var rc = sock.setsockopt(nn.NN_SOL_SOCKET, nn.NN_RECONNECT_IVL, 1000);
    t.equal(rc, 0);
    rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_RECONNECT_IVL);
    t.equal(rc, 1000);
    sock.close();
});

test('NN_RECONNECT_IVL_MAX can be set to 1000', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var rc = sock.setsockopt(nn.NN_SOL_SOCKET, nn.NN_RECONNECT_IVL_MAX, 1000);
    t.equal(rc, 0);
    rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_RECONNECT_IVL_MAX);
    t.equal(rc, 1000);
    sock.close();
});

test('NN_SNDPRIO can be set to 16', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var rc = sock.setsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDPRIO, 16);
    t.equal(rc, 0);
    rc = sock.getsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDPRIO);
    t.equal(rc, 16);
    sock.close();
});

test('setsockopt throws exception for unsupported send priority', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for unsupported send priority');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.setsockopt(nn.NN_SOL_SOCKET, nn.NN_SNDPRIO, 32);
});

test('setsockopt throws exception for unsupported socket level', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for unsupported socket level');
        t.equal(nn.Errno(), nn.ENOPROTOOPT);
        sock.close();
    });

    sock.setsockopt(999999, nn.NN_SNDPRIO, 8);
});

test('setsockopt throws exception for unsupported socket option', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for unsupported socket option');
        t.equal(nn.Errno(), nn.ENOPROTOOPT);
        sock.close();
    });

    sock.getsockopt(nn.NN_SOL_SOCKET, 999999, 8);
});
