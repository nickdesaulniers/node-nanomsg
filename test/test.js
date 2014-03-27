// http://tim.dysinger.net/posts/2013-09-16-getting-started-with-nanomsg.html

var assert = require('assert');
var should = require('should');
var nano = require('../');

var test = require('tape');

test('bindings should exist', function (t) {
  t.plan(2);
  
  t.equal(typeof nano._bindings.AF_SP, 'number', 'AF_SP is a number')
  t.equal(typeof nano._bindings.NN_PAIR, 'number', 'NN_PAIR is a number');
});


test('socket pub sub', function (t) {
  t.plan(1);

  var pub = nano.socket('pub');
  var sub = nano.socket('sub');

  var addr = 'inproc://pubsub';
  var msg = 'hello world';

  pub.bind(addr);
  sub.connect(addr);

  sub.on('message', function (buf) {
    t.equal(buf.toString(), msg);

    pub.close();
    sub.close();
  });

  setTimeout(function () {
    pub.send(msg);
  }, 100);
});


test('socket pairs', function (t) {
  t.plan(1);

  var s1 = nano.socket('pair');
  var s2 = nano.socket('pair');

  var addr = 'inproc://pairs';
  var msg = 'hello world';

  s1.bind(addr);
  s2.connect(addr);

  s1.on('message', function (buf) {
    t.equal(buf.toString(), msg);

    s1.close();
    s2.close();
  });

  setTimeout(function () {
    s2.send(msg);
  }, 100);
});


test('socket req rep', function (t) {
  t.plan(2);

  var req = nano.socket('req');
  var rep = nano.socket('rep');

  var addr = 'inproc://reqrep';
  var msg1 = 'knock knock';
  var msg2 = 'whose there?'

  rep.bind(addr);
  req.connect(addr);

  rep.on('message', function (buf) {
    t.equal(buf.toString(), msg1, 'request received');
    rep.send(msg2);
  });

  req.on('message', function (buf) {
    t.equal(buf.toString(), msg2, 'reply received');

    req.close();
    rep.close();
  });

  setTimeout(function () {
    req.send(msg1);
  }, 100);
});


test('multiple binds on same address', function (t) {
  t.plan(1);

  var s1 = nano.socket('pair');
  var s2 = nano.socket('pair');

  var addr = 'inproc://multiplebinds';

  s2.on('error', function (err) {
    t.ok(err, 'error was thrown.')

    s1.close();
    s2.close();
  })

  s1.bind(addr);
  s2.bind(addr);
});
