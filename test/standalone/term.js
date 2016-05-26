// https://github.com/chuckremes/nn-core/blob/master/spec/nn_term_spec.rb

var nano = require('../../');
var test = require('tape');

test('no longer throw exception when sending on socket after term() called', function (t) {
  t.plan(1);

  var sock = nano.socket('pub');
  sock.bind('tcp://127.0.0.1:9999')

  sock.send("Hello");
  nano.term();

  setTimeout(function(){

    t.ok('library exit', 'exits cleanly now and sockets are closed.')
    sock.close()
  }, 100)

});
