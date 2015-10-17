var nano = require('../..');
var pair = nano.socket('pair');

pair.bind('ws://127.0.0.1:7789');
pair.on('data', function(msg){
  pair.send(msg+'');
  console.log('msg recv\'d: '+msg);
});

require('http').createServer(function (req, res) {
  require('fs').createReadStream('index.html').pipe(res);
}).listen(3000);
