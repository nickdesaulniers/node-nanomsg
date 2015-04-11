var nano = require('..');
var test = require('tape');

test('map connect address eid for valid INPROC address', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.connect('inproc://some_address');

  if (sock.connected['inproc://some_address'] > -1) {
    t.pass('valid INPROC connect');
  } else {
    t.pass('INPROC connect fail');
  }

  sock.close();
});

test('map connect address eid for valid IPC address', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.connect('ipc://some_address');

  if (sock.connected['ipc://some_address'] > -1) {
    t.pass('valid IPC connect');
  } else {
    t.pass('IPC connect fail');
  }

  sock.close();
});

test('map connect address eid for valid TCP address', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.connect('tcp://127.0.0.1:5555');

  if (sock.connected['tcp://127.0.0.1:5555'] > -1) {
    t.pass('valid TCP connect');
  } else {
    t.pass('TCP connect fail');
  }

  sock.close();
});

test('connect exception: invalid INPROC address', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'Invalid argument', err.message);
    sock.close();
  });

  sock.connect('inproc:/missing_first_slash');

});


test('connect exception: invalid INPROC address (too long)', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'File name too long');
    sock.close();
  });

  var addr = new Array(nano._bindings.NN_SOCKADDR_MAX + 1).join('a');
  sock.connect('inproc://' + addr);
});

test('connect exception: invalid TCP address (missing)', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'Invalid argument', err.message);
    sock.close();
  });

  sock.connect('tcp://');
});

test('connect exception: invalid TCP address (non-numeric port)', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'Invalid argument', err.message);
    sock.close();
  });

  sock.connect('tcp://127.0.0.1:port');
});

test('connect exception: invalid TCP address (port out of range)', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'Invalid argument', err.message);
    sock.close();
  });

  sock.connect('tcp://127.0.0.1:65536');
});

test('connect exception: unsupported transport', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');

  sock.on('error', function (err) {
    t.equal(err.message,
      'Protocol not supported', err.message);
    sock.close();
  });

  sock.connect('zmq://127.0.0.1:6000');
});
