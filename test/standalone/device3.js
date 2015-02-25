// https://github.com/nanomsg/nanomsg/blob/master/tests/device.c
// test nn_device() with a single BUS socket (ie LOOPBACK device)
//
// *NB* this is a standalone script because it calls nn_term() and therefore
// cannot coexist with any other nanomsg tests in the same process.

var nano = require('../../');
var test = require('tape');

test('create loopback device with one socket', function (t) {
    t.plan(2);

    var r1 = nano.socket('bus', { raw: true });

    var addr = 'inproc://device1';
    var msg = "Hello";

    r1.bind(addr);

    var d = nano.device(r1);

    d.on('error', function (err) {
        t.ok(err, 'error was thrown when device collapsed:' + err);
        r1.close();
    });


    var s1 = nano.socket('bus');
    var s2 = nano.socket('bus');

    s1.connect(addr);
    s2.connect(addr);

    s2.on('data', function (buf) {
        t.equal(buf.toString(), msg);
        s1.close();
        s2.close();

        // nano.term() is the only way to shutdown a nano.device() !
        nano.term();
    });

    setTimeout(function () {
        s1.send(msg);
    }, 100);

});
