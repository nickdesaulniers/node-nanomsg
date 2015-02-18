// http://tim.dysinger.net/posts/2013-09-16-getting-started-with-nanomsg.html

// This test suite is a duplicate of inproc.js, but using the ipc
// transport.

var assert = require('assert');
var should = require('should');
var nano = require('../');
var fs = require('fs');

var test = require('tape');

test('streams2 implemented', function (t) {
    t.plan(2);

    var pub = nano.socket('pub');
    var sub = nano.socket('sub');

    var addr = 'ipc:///tmp/pubsub.ipc';
    var msg = 'hello world';

    pub.bind(addr);
    sub.connect(addr);

    var out = fs.createWriteStream('/tmp/nanomsg-streams-test');
    sub.pipe(out);

    sub.on('message', function (buf) {
        t.equal(buf.toString(), msg);

        pub.close();
        sub.close();

        out.on('close', function () {
            var dump = fs.readFileSync('/tmp/nanomsg-streams-test', 'utf-8');
            t.equal(dump, 'hello world');
        });
        out.end();
    });

    setTimeout(function () {
        pub.send(msg);
    }, 100);
});
