// Use Socket::transform and Socket::restore for message passing.
// http://tim.dysinger.net/posts/2013-09-16-getting-started-with-nanomsg.html

var nano = require('../');
var test = require('tape');

nano.Socket.prototype.transform = function (buf) {
    if (!Buffer.isBuffer(buf)) buf = new Buffer(buf);
    return Buffer.concat([new Buffer([0x00]), buf]);
}

nano.Socket.prototype.restore = function (buf) {
    return Buffer.concat([new Buffer([0xFF]), buf]);
}

test('inproc socket pub sub', function (t) {
    t.plan(3);

    var pub = nano.socket('pub');
    var sub = nano.socket('sub');

    var addr = 'inproc://pubsub';
    var msg = 'hello world';

    pub.bind(addr);
    sub.connect(addr);

    sub.on('data', function (buf) {
        t.equal(buf.slice(2).toString(), msg);
        t.equal(buf[0], 0xFF);
        t.equal(buf[1], 0x00);

        pub.close();
        sub.close();
    });

    setTimeout(function () {
        pub.send(msg);
    }, 100);
});
