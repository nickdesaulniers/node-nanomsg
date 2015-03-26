// https://github.com/chuckremes/nn-core/blob/master/spec/nn_close_spec.rb

var nano = require('../');
var test = require('tape');

test('close a valid socket', function (t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var rc = sock.close();
    t.equal(rc, 0);
});

test('throw exception when closing invalid socket', function (t) {
    // we can't test a close on an arbitrary fd as per the original test,
    // because in our world close() is a method on a Socket object.
    // We can test a double close on the same socket tho.
    // Currently this is rigged so that the second (and any subsequent)
    // close returns the same value as the first.
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('close', function (){
        t.ok(true, 'socket emitted close event');
    })

    var rc = sock.close();
    var rc2 = sock.close();

    t.equal(rc, rc2);
});

