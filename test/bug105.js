var nano = require('..')
var test = require('tape');

// see: https://github.com/nickdesaulniers/node-nanomsg/issues/105
test('multiple req sockets should not throw', function (t) {
  t.plan(1);

  var tcp = 'tcp://127.0.0.1:9080';
  var server = nano.socket('rep');

  var counter = 10;

  server.setEncoding('utf8');
  server.bind(tcp);

  server.on('data', function (data) {
    server.send(data);
    if (!(--counter)) {
      clearInterval(int1);
      clearInterval(int2);
      client.close();
      clientb.close();
      server.close();
      t.pass('no crashes');
    }
  })

  var client = nano.socket('req');

  client.setEncoding('utf8');
  client.connect(tcp);

  var int1 = setInterval(function () {
    client.send('3');
  });

  var clientb = nano.socket('req');
  clientb.setEncoding('utf8');
  clientb.connect(tcp);

  var int2 = setInterval(function () {
    clientb.send('3');
  });
});

