// http://tim.dysinger.net/posts/2013-09-16-getting-started-with-nanomsg.html

// This test suite is a duplicate of inproc.js, but using the tcp
// transport.

var nano = require('../');
var test = require('tape');

test('tcp socket pub sub', function (t) {
    t.plan(1);

    var pub = nano.socket('pub');
    var sub = nano.socket('sub');

    var addr = 'tcp://127.0.0.1:35010';
    var msg = 'hello world';

    pub.bind(addr);
    sub.connect(addr);

    sub.on('data', function (buf) {
        t.equal(buf.toString(), msg);

        pub.close();
        sub.close();
    });

    pub.send(msg);
});

test('tcp socket pairs', function (t) {
    t.plan(1);

    var s1 = nano.socket('pair');
    var s2 = nano.socket('pair');

    var addr = 'tcp://127.0.0.1:35020';
    var msg = 'hello world';

    s1.bind(addr);
    s2.connect(addr);

    s1.on('data', function (buf) {
        t.equal(buf.toString(), msg);

        s1.close();
        s2.close();
    });

    s2.send(msg);
});

test('tcp socket req rep', function (t) {
    t.plan(2);

    var req = nano.socket('req');
    var rep = nano.socket('rep');

    var addr = 'tcp://127.0.0.1:35030';
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

    req.send(msg1);
});

test('tcp socket survey', function (t) {
    t.plan(3);

    var sur = nano.socket('surveyor');
    var rep1 = nano.socket('respondent');
    var rep2 = nano.socket('respondent');
    var rep3 = nano.socket('respondent');

    var addr = 'tcp://127.0.0.1:35040';
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

    sur.send(msg1);
});

test('tcp socket bus', function (t) {
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
            var addr = 'tcp://127.0.0.1:' + (36219 + i);
            bus.bind(addr);
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

    // Connect all possible pairs of buses.
    var keys = Object.keys(buses);

    for (var i = 0; i < keys.length; i++) {
        for (var j = i+1; j < keys.length; j++) {
            //console.error('#', 'connecting', keys[i], 'to', keys[j]);
            buses[keys[i]].connect(keys[j]);
        }
    }

    // Send messages on every bus.

    Object.keys(buses).forEach(function (addr) {
        //console.error('#', 'writing on', addr, addr);
        buses[addr].send(addr);
    });
});

test('tcp multiple socket pub sub', function (t) {
    t.plan(3);

    var pub = nano.socket('pub');
    var sub1 = nano.socket('sub');
    var sub2 = nano.socket('sub');
    var sub3 = nano.socket('sub');

    var addr = 'tcp://127.0.0.1:35050';
    var msg = 'hello world';

    pub.bind(addr);
    sub1.connect(addr);
    sub2.connect(addr);
    sub3.connect(addr);

    var responses = 0;

    var resp_handler = function (buf) {
        t.equal(buf.toString(), msg);

        responses++;

        if(responses == 3) {
            pub.close();
            sub1.close();
            sub2.close();
            sub3.close();
        }
    };

    sub1.on('data', resp_handler);
    sub2.on('data', resp_handler);
    sub3.on('data', resp_handler);

    pub.send(msg);
});
