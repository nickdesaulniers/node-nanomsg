var nano = require('..');
var test = require('tape');

test('push stress', function (t) {
  t.plan(4);
  var i = 9999;
  var pull = nano.socket('pull', {encoding:'utf8'} );
  var push = nano.socket('push');
  var addr = 'tcp://127.0.0.1:7799';
  var msg = 'hello from nanomsg stream api'
  pull.connect(addr);
  push.bind(addr);
  pull.on('data', function(data){
    if (data !== msg)
      throw new Error('assertion failed');
    if (++i === 9998) {
      t.equal(push.dontwait(), false);
      t.equal(push.nndontwait, 0);
      t.equal(pull.dontwait(), true);
      t.equal(pull.nndontwait, 1);
      push.close();
      pull.close();
    }
  });
  while (i--)
    push.send(msg);
});

test('set dontwait at init and verify sockopt results', function (t) {
  t.plan(4);
  var i = 9;
  var pull = nano.socket('pull', {encoding:'utf8', dontwait: false} );
  var push = nano.socket('push', {dontwait: true});
  var addr = 'tcp://127.0.0.1:7899';
  var msg = 'hello from nanomsg stream api'
  pull.connect(addr);
  push.bind(addr);
  pull.on('data', function(data){
    if (data !== msg)
      throw new Error('assertion failed');
    if (++i === 8) {
      // check nndontwait values set at init and compare assumption w/ sockopt
      t.equal(pull.nndontwait, 0);
      t.equal(pull.dontwait(), false);

      t.equal(push.nndontwait, 1);
      t.equal(push.dontwait(), true);
      push.close();
      pull.close();
    }
  });
  while (i--)
    push.send(msg);
});
