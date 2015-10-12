var nano = require('..');
var test = require('tape');

test('pipe a thousand msgs between incompatible socket types', function(t){

  var sent = 0, recv = 0;

  var pub = nano.socket('pub', { tcpnodelay: true });
  var sub = nano.socket('sub', { tcpnodelay: true });

  var push = nano.socket('push');
  var pull = nano.socket('pull');
  pull.setEncoding('utf8'); //should also be able to do in `socket(type, opts)`

  var count = 0;
  pub.bind('tcp://127.0.0.1:64999');
    sub.connect('tcp://127.0.0.1:64999', function () {
      console.log('connected 64999');

      pull.bind('tcp://127.0.0.1:65000');
        push.connect('tcp://127.0.0.1:65000', function () {
          console.log('connected 65000');

          sub.pipe(push);
          pull.on('data', pullsocket);

          while(sent++ < 1001) pub.send('hello from nanomsg pub socket!');

          function pullsocket(msg){
            console.log(count++);
            if(recv++ > 999){
              t.equal( msg, 'hello from nanomsg pub socket!', 'piped a pub/pull combo');
              pub.close();
              push.close();
              pull.close();
              sub.close();
              t.end();
            }
          }
        });
    });
});
