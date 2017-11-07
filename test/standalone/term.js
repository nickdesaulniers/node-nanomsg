// https://github.com/chuckremes/nn-core/blob/master/spec/nn_term_spec.rb

var nano = require('../../');
var test = require('tape');

test('no issue calling term after closing all sockets', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.bind('tcp://127.0.0.1:9999')

  sock.send('Hello');
  sock.close();
  nano.term();
  t.ok('library exit', 'exits cleanly now and sockets are closed.')
});
