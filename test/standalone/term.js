// https://github.com/chuckremes/nn-core/blob/master/spec/nn_term_spec.rb

var nano = require('../../');
var test = require('tape');

test('throw exception when sending on socket after term() called', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.bind('tcp://127.0.0.1:9999')

  sock.on('error', function (err) {
    t.ok(err, 'library termination error thrown on send after term');
    sock.close();
  });

  sock.send("Hello");
  nano.term();

});
