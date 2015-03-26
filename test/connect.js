// https://github.com/chuckremes/nn-core/blob/master/spec/nn_connect_spec.rb

var nano = require('../');
var nn = nano._bindings;
var test = require('tape');


test('connect returns non-zero endpoint number for valid INPROC address', function (t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.connect('inproc://some_address');

    if(rc < 0) {
        t.fail('INPROC endpoint number invalid');
    } else {
        t.pass('INPROC endpoint number valid');
    }

    sock.close();
});

test('connect returns non-zero endpoint number for valid IPC address', function (t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.connect('ipc:///tmp/some_address.ipc');

    if(rc < 0) {
        t.fail('IPC endpoint number invalid');
    } else {
        t.pass('IPC endpoint number valid');
    }

    sock.close();
});

test('connect returns non-zero endpoint number for valid TCP address', function (t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.connect('tcp://127.0.0.1:5555');

    if(rc < 0) {
        t.fail('TCP endpoint number invalid');
    } else {
        t.pass('TCP endpoint number valid');
    }

    sock.close();
});

test('connect throws for invalid INPROC address', function (t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function (err) {
        t.ok(err, 'exception thrown for invalid INPROC address (missing slash)');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.connect('inproc:/missing_first_slash');
});

test('connect throws for invalid INPROC address (too long)', function (t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function (err) {
        t.ok(err, 'exception thrown for invalid INPROC address (too long)');
        t.equal(nn.Errno(), nn.ENAMETOOLONG);
        sock.close();
    });

    var addr = new Array(nn.NN_SOCKADDR_MAX + 1).join('a');
    sock.connect('inproc://' + addr);
});

test('connect throws for invalid IPC address', function (t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function (err) {
        t.ok(err, 'exception thrown for invalid IPC address');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.connect('ipc:/missing_first_slash');
});

test('connect throws for invalid TCP address (missing address)', function (t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function (err) {
        t.ok(err, 'exception thrown for missing TCP address');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.connect('tcp://');
});

test('connect throws for invalid TCP address (non-numeric port)', function (t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function (err) {
        t.ok(err, 'exception thrown for TCP non-numeric port');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.connect('tcp://127.0.0.1:port');
});

test('connect throws for invalid TCP address (port out of range)', function (t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function (err) {
        t.ok(err, 'exception thrown for invalid TCP port');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.connect('tcp://127.0.0.1:65536');
});

test('connect throws for unsupported transport', function (t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function (err) {
        t.ok(err, 'exception thrown for unsupported transport');
        t.equal(nn.Errno(), nn.EPROTONOSUPPORT);
        sock.close();
    });

    sock.connect('zmq://127.0.0.1:6000');
});


test('connect returns 2 for INPROC rebind to existing endpoint', function (t) {
    t.plan(2);

    var sock = nano.socket('pub');
    var addr ='inproc://some_endpoint';

    var rc = sock.connect(addr);
    t.equal(rc, 1); 
    var rc2 = sock.connect(addr);
    t.equal(rc2, 2);
    sock.close();
});

