// https://github.com/chuckremes/nn-core/blob/master/spec/nn_term_spec.rb

var nano = require('../../');
var test = require('tape');

test('throw exception when seding on socket after term() called', function (t) {
    t.plan(1);

    var sock = nano.socket('pub');

    sock.on('error', function (err) {
        t.ok('error was thrown on send after term');
        sock.close();
    });

    sock.send("Hello");
    nano.term();

});


