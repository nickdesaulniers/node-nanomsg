var nano = require('../');

var rep = nano.socket('rep');
var req = nano.socket('req');

var addr = 'tcp://127.0.0.1:5555';

rep.bind(addr);
req.connect(addr);

rep.on('data', function (buf) {
  console.log('received request: ', buf.toString());
  rep.send('world');
});

req.on('data', function (buf) {
  console.log('received response: ', buf.toString());
  req.close();
  rep.close();
});

req.send('hello');
