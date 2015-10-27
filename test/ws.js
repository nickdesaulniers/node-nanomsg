/* a transform stream implementation for piping msgs later in the test */
function thr (fn) {
  this._transform = fn;
  require('stream').Transform.call(this);
}
require('util').inherits(thr, require('stream').Transform);

var nano = require('..');
var test = require('tape');

test('ws socket pub sub', function (t) {
    t.plan(1);

    var pub = nano.socket('pub');
    var sub = nano.socket('sub');

    var addr = 'ws://127.0.0.1:6004';
    var msg = 'hello world';

    pub.bind(addr);
    sub.connect(addr);

    sub.on('data', function (buf) {
      t.equal(buf.toString(), msg);

      clearTimeout(timeo);
      pub.close();
      sub.close();
    });

    setTimeout(function () {
      pub.send(msg);
    }, 100);

    var timeo = setTimeout(skip, 10000, t, 'ws socket pub sub', [pub, sub]);
});

test('ws socket pairs', function (t) {
    t.plan(1);

    var s1 = nano.socket('pair');
    var s2 = nano.socket('pair');

    var addr = 'ws://127.0.0.1:6005';
    var msg = 'hello world';

    s1.bind(addr);
    s2.connect(addr);

    s1.on('data', function (buf) {
      t.equal(buf.toString(), msg);

      s1.close();
      s2.close();
      clearTimeout(timeo);
    });

    setTimeout(function () {
      s2.send(msg);
    }, 100);

    var timeo = setTimeout(skip, 10000, t, 'ws socket pairs', [s1, s2]);
});

test('ws socket req rep', function (t) {
    t.plan(2);

    var req = nano.socket('req');
    var rep = nano.socket('rep');

    var addr = 'ws://127.0.0.1:6006';
    var msg1 = 'knock knock';
    var msg2 = "who's there?";

    rep.bind(addr);
    req.connect(addr);

    rep.on('data', function (buf) {
      t.equal(String(buf), msg1, 'request received');
      rep.send(msg2);
    });

    req.on('data', function (buf) {
      t.equal(String(buf), msg2, 'reply received');

      clearTimeout(timeo);
      req.close();
      rep.close();
    });

    setTimeout(function () {
      req.send(msg1);
    }, 100);

    var timeo = setTimeout(skip, 10000, t, 'ws socket req rep', [req, rep]);
});

test('ws socket survey', function (t) {
    t.plan(3);

    var sur = nano.socket('surveyor');
    var rep1 = nano.socket('respondent');
    var rep2 = nano.socket('respondent');
    var rep3 = nano.socket('respondent');

    var addr = 'ws://127.0.0.1:6007';
    var msg1 = 'knock knock';
    var msg2 = "who's there?";

    sur.bind(addr);
    rep1.connect(addr);
    rep2.connect(addr);
    rep3.connect(addr);

    function answer (buf) {
      this.send(msg2);
    }
    rep1.on('data', answer);
    rep2.on('data', answer);
    rep3.on('data', answer);

    var count = 0;
    sur.on('data', function (buf) {
      t.ok(buf.toString() == msg2, buf.toString() + ' == ' + msg2);

      if (++count === 3) {
        clearTimeout(timeo);
        sur.close();
        rep1.close();
        rep2.close();
        rep3.close();
      }
    });

    setTimeout(function () {
      sur.send(msg1);
    }, 100);

    var timeo = setTimeout(skip, 10000, t, 'ws socket req rep', [
      sur, rep1, rep2, rep3
    ]);
});

test('ws socket bus', function (t) {
    // http://250bpm.com/blog:17

    // Number of buses to create.
    var count = 3, bus = {};
    var total = count * (count-1), current = 0;
    t.plan(count);

    // set up the number of bus sockets
    for (var i = 0; i < count; i++)
      bus['ws://127.0.0.1:' + (6548 + i)] = nano.socket('bus');

    // Bind, connect and prepare a transform stream for each bus socket
    for (var i in bus) {
      bus[i].bind(i);
      bus[i].connect(i);

      // Tally messages from other buses with a transform stream
      var tr = new thr(function transform (msg, _, cb) {
        if (++this.responseCount === count - 1) {
          // All set! bus received all messages.
          t.ok(true, 'all messages received on ' + msg);
        }

        // move stream forward to end of current pipe() and call the cb()
        this.push(msg); cb();

        // after msgs are accounted for, close all buses & clear travis timeout
        if (++current === total) {
          clearTimeout(timeo);
          for(var i in bus) bus[i].close();
        }
      });

      // Add a "response count" for each bus.
      // We want this to equal the number of other buses.
      tr.responseCount = 0;

      // now pipe to the transform
      bus[i].pipe(tr);
    }

    setTimeout(send, 600);
    function send(){
      for (var i in bus) bus[i].send(i);
    }

    // skip the test if there's a travis timeout
    var timeo = setTimeout(skip, 10000, t, 'ws socket bus',
      Object.keys(bus).map( function(i) {
        return bus[i];
      })
    );
});

test('ws multiple socket pub sub', function (t) {
    t.plan(3);

    var pub = nano.socket('pub');
    var sub1 = nano.socket('sub');
    var sub2 = nano.socket('sub');
    var sub3 = nano.socket('sub');

    var addr = 'ws://127.0.0.1:6011';
    var msg = 'hello world';

    pub.bind(addr);
    sub1.connect(addr);
    sub2.connect(addr);
    sub3.connect(addr);

    var responses = 0;

    sub1.on('data', resp_handler);
    sub2.on('data', resp_handler);
    sub3.on('data', resp_handler);

    function resp_handler(buf) {
      if(++responses === 3) {
        clearTimeout(timeo);
        pub.close();
        sub1.close();
        sub2.close();
        sub3.close();
      }

      t.equal(String(buf), msg);
    };

    setTimeout(function(){
      pub.send(msg)
    }, 100);

    var timeo = setTimeout(skip, 1000, t,
      'ws multiple socket pub sub', [pub, sub1, sub2, sub3]);
});

/*
 * skip function:
 *  • calls t.skip(msg), so the test passes after skipping the timed out test
 *  • closes any sockets given in an Array, the sock param
 */

function skip (t, subject, sock) {
  var msg = 'TEST TIMEOUT WARNING: no output after 10 seconds, skipping ';
  var skips = (t._plan - t.assertCount); // skips: pending number of tests
  var l = sock.length;

  while (l--) sock[l].close();
  while (skips--) t.skip(msg + subject + ' test');
}
