// https://github.com/chuckremes/nn-core/blob/master/spec/nn_send_spec.rb

var nano = require('../');
var nn = nano._bindings;

var test = require('tape');


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

