// https://github.com/nanomsg/nanomsg/blob/master/tests/device.c
// test nn_device() with two PAIR sockets (ie BIDIRECTIONAL device)
//
// *NB* this is a standalone script because it calls nn_term() and therefore
// cannot coexist with any other nanomsg tests in the same process.

var nano = require('../../');
var test = require('tape');

test('create bidirectional device with two sockets', function (t) {
    t.plan(3);

    var r1 = nano.socket('pair', { raw: 1 });
    var r2 = nano.socket('pair', { raw: 1 });

    var addr1 = 'inproc://device01';
    var addr2 = 'inproc://device02';
    var msg1 = "Hello";
    var msg2 = "World";

    r1.bind(addr1);
    r2.bind(addr2);

    var d = nano.device(r1, r2);

    d.on('error', function (err) {
        t.ok(err, 'error was thrown when device collapsed:' + err);
        r1.close();
        r2.close();
    });


    var s1 = nano.socket('pair');
    var s2 = nano.socket('pair');

    s1.connect(addr1);
    s2.connect(addr2);

    s1.on('data', function (buf) {
        t.equal(buf.toString(), msg2);
        s1.close();
        s2.close();

        // nano.term() is the only way to shutdown a nano.device() !
        nano.term();
    });

    s2.on('data', function (buf) {
        t.equal(buf.toString(), msg1);
        s2.send(msg2);
    });

    setTimeout(function () {
        s1.send(msg1);
    }, 100);

});
