var nano = require('..');
var test = require('tape');

test('push stress', function (t) {
  t.plan(2);
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
      t.equal(push.nndontwait, 0);
      t.equal(this.nndontwait, 1);
      push.close();
      pull.close();
    }
  });
  while (i--)
    push.send(msg);
});

test('set dontwait options', function (t) {
  t.plan(2);
  var i = 9;
  var pull = nano.socket('pull', {encoding:'utf8', dontwait:0} );
  var push = nano.socket('push', {dontwait:1});
  var addr = 'tcp://127.0.0.1:7899';
  var msg = 'hello from nanomsg stream api'
  pull.connect(addr);
  push.bind(addr);
  pull.on('data', function(data){
    if (data !== msg)
      throw new Error('assertion failed');
    if (++i === 8) {
      t.equal(push.nndontwait, 1);
      t.equal(this.nndontwait, 0);
      push.close();
      pull.close();
    }
  });
  while (i--)
    push.send(msg);
});
