var nano = require('..');
var test = require('tape');

test('map bind address eid for valid INPROC address', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.bind('inproc://some_address');

  if (sock.bound['inproc://some_address'] > -1) {
    t.pass('valid INPROC bind');
  } else {
    t.pass('INPROC bind fail');
  }

  sock.close();
});

test('map bind address eid for valid IPC address', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.bind('ipc://some_address');

  if (sock.bound['ipc://some_address'] > -1) {
    t.pass('valid IPC bind');
  } else {
    t.pass('IPC bind fail');
  }

  sock.close();
});

test('map bind address eid for valid TCP address', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.bind('tcp://127.0.0.1:5555');

  if (sock.bound['tcp://127.0.0.1:5555'] > -1) {
    t.pass('valid TCP bind');
  } else {
    t.pass('TCP bind fail');
  }

  sock.close();
});

test('bind exception: invalid INPROC address', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {

    t.equal(err.message,
      'Invalid argument', err.message);
    sock.close();
  });

  sock.bind('inproc:/missing_first_slash');

});


test('bind exception: invalid INPROC address (too long)', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'File name too long');
    sock.close();
  });

  var addr = new Array(nano._bindings.NN_SOCKADDR_MAX + 1).join('a');
  sock.bind('inproc://' + addr);
});

test('bind exception: invalid TCP address (missing)', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'Invalid argument', err.message);
    sock.close();
  });

  sock.bind('tcp://');
});

test('bind exception: invalid TCP address (non-numeric port)', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'Invalid argument', err.message);
    sock.close();
  });

  sock.bind('tcp://127.0.0.1:port');
});

test('bind exception: invalid TCP address (port out of range)', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'Invalid argument', err.message);
    sock.close();
  });

  sock.bind('tcp://127.0.0.1:65536');
});

test('bind exception: unsupported transport', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'Protocol not supported', err.message);
    sock.close();
  });

  sock.bind('zmq://127.0.0.1:6000');
});

test('bind exception: TCP on non-existent device', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.ok(err, 'Operation not supported by device: tcp://eth99:555');
    sock.close();
  });

  sock.bind('tcp://eth99:555');
});
