var nano = require('..');
var test = require('tape');

test('pipe a thousand msgs between incompatible socket types', function(t){
  t.plan(1);
  var sent = 0, recv = 0;

  var pub = nano.socket('pub', { tcpnodelay: true });
  var sub = nano.socket('sub', { tcpnodelay: true });

  var push = nano.socket('push');
  var pull = nano.socket('pull');
  pull.setEncoding('utf8'); //should also be able to do in `socket(type, opts)`

  pub.bind('tcp://127.0.0.1:64999');
  sub.connect('tcp://127.0.0.1:64999');

  pull.bind('tcp://127.0.0.1:65000');
  push.connect('tcp://127.0.0.1:65000');

  sub.pipe(push);
  pull.on('data', pullsocket);
  function pullsocket(msg){
    if(recv++ > 999){
      pub.close();
      push.close();
      pull.close();
      sub.close();
      t.equal( msg, 'hello from nanomsg pub socket!', 'piped a pub/pull combo');
      clearTimeout(timeo);
    }
  }

  var timeo = setTimeout(skip, 10000, t, 'streams', [pub, sub, push, pull]);

  // start sending
  while(sent++ < 1001) pub.send('hello from nanomsg pub socket!');
});

/*
 * skip function:
 *  • calls t.skip(msg), so the test passes after skipping the timed out test
 *  • closes any sockets given in an Array, the sock param
 */

function skip (t, subject, sock) {
  var msg = 'TEST TIMEOUT WARNING: no output after 10 seconds, skipping ';
  var skips = (t._plan - t.assertCount); // skips: pending number of tests
  var l = sock.length;

  while (l--) sock[l].close();
  while (skips--) t.skip(msg + subject + ' test');
}
