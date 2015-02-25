// https://github.com/chuckremes/nn-core/blob/master/spec/nn_send_spec.rb

var nano = require('..');
var test = require('tape');

// Polyfills Buffer.prototype.equals for Node.js 0.10
// See: https://github.com/nickdesaulniers/node-nanomsg/issues/82
require('buffer-equals-polyfill');

test('send returns number of bytes sent for bound socket', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.bind('inproc://some_address');
  var rc = sock.send('ABC');
  t.equal(rc, 3);
  sock.close();
});

test('send returns number of bytes queued for unbound socket', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  var rc = sock.send('ABC');
  t.equal(rc, 3);
  sock.close();
});

test('send can take a string', function (t) {
  t.plan(3);

  var pub = nano.socket('pub');
  var sub = nano.socket('sub');
  var addr = 'inproc://some_address';
  var msg = 'hi';

  pub.bind(addr);
  sub.connect(addr);

  sub.on('data', function (buf) {
    t.equal(buf.toString(), msg);
    t.equal(buf.length, msg.length);
    pub.close();
    sub.close();
  });

  var bytes = pub.send(msg);
  t.equal(bytes, msg.length);
});

test('send can take a buffer', function (t) {
  t.plan(3);

  var pub = nano.socket('pub');
  var sub = nano.socket('sub');
  var addr = 'inproc://some_address';
  var msg = new Buffer('hello');

  pub.bind(addr);
  sub.connect(addr);

  sub.on('data', function (buf) {
    t.equal(buf.toString(), msg.toString());
    t.equal(buf.length, msg.length);
    pub.close();
    sub.close();
  });

  var bytes = pub.send(msg);
  t.equal(bytes, msg.length);
});

test('should not null terminate when sending strings', function (t) {
  t.plan(3);

  var pub = nano.socket('pub');
  var sub = nano.socket('sub');
  var addr = 'inproc://some_address';
  var msg = 'hello';

  pub.bind(addr);
  sub.connect(addr);

  sub.on('data', function (buf) {
    if (buf[buf.length - 1] === 0) {
      t.fail();
    }
    t.equal(buf.equals(new Buffer(msg)), true);
    t.equal(buf.length, msg.length);
    pub.close();
    sub.close();
  });

  var bytes = pub.send(msg);
  t.equal(bytes, msg.length);

});

test('send can take a number', function (t) {
  t.plan(2);

  var pub = nano.socket('pub');
  var sub = nano.socket('sub');
  var addr = 'inproc://some_address';
  var msg = Math.pow(2, 42);

  pub.bind(addr);
  sub.connect(addr);

  sub.on('data', function (buf) {
    t.equal(buf.toString(), msg.toString());
    pub.close();
    sub.close();
  });

  var bytes = pub.send(msg);
  t.equal(bytes, msg.length);
});
