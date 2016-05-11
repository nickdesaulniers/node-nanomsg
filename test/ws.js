// This test suite is a duplicate of inproc.js, but using the ws transport.

var nano = require('../');
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

      pub.close();
      sub.close();
    });

    setTimeout(function () {
      pub.send(msg);
    }, 300);
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
    });

    setTimeout(function () {
      s2.send(msg);
    }, 300);
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
      t.equal(buf.toString(), msg1, 'request received');
      rep.send(msg2);
    });

    req.on('data', function (buf) {
      t.equal(buf.toString(), msg2, 'reply received');

      req.close();
      rep.close();
    });

    setTimeout(function () {
      req.send(msg1);
    }, 300);
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

      if (++count == 3) {
        sur.close();
        rep1.close();
        rep2.close();
        rep3.close();
      }
    });

    setTimeout(function () {
      sur.send(msg1);
    }, 300);
});

test('ws socket bus', function (t) {
    // http://250bpm.com/blog:17

    // Number of buses to create.
    var count = 3;
    var total = count * (count-1), current = 0;
    t.plan(count);

    // Create buses.
    var buses = {};
    for (var i = 0; i < count; i++) {
      (function (i) {
        var bus = nano.socket('bus');
        var addr = 'ws://127.0.0.1:' + (6008 + i);
        bus.bind(addr);
        bus.connect(addr);
        buses[addr] = bus;

        // Add a "response count" for each bus.
        // We want this to equal the number of other buses.
        bus.responseCount = 0;

        // Tally messages from other buses.
        bus.on('data', function (msg) {
          //console.error('#', 'received data from', msg.toString(), 'on', addr)
          this.responseCount++;
          current++;

          if (this.responseCount == count - 1) {
            // All set! bus received all messages.
            t.ok(true, 'all messages received on ' + addr);
          }

          if (current == total) {
            // close all buses.
            Object.keys(buses).forEach(function (addr) {
              buses[addr].close();
            })
          }
        });
      })(i);
    }

    // Send messages on every bus.
    setTimeout(function () {
      Object.keys(buses).forEach(function (addr) {
        //console.error('#', 'writing on', addr, addr);
        buses[addr].send(addr);
      });
    }, 1500);
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

      if(++responses == 3) {
        pub.close();
        sub1.close();
        sub2.close();
        sub3.close();
      }

      t.equal(buf.toString(), msg);
    };

    setTimeout(function () {
      pub.send(msg);
    }, 300);
});
