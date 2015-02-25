var nano = require('..')

var pub = nano.socket('pub');
var sub = nano.socket('sub');

pub.bind('inproc://transform');
sub.connect('inproc://transform');

/**
 * minimal transform stream implementation
 */
require('util').inherits(thr, require('stream').Transform);
function thr(fn){
  this._transform = fn;
  require('stream').Transform.call(this);
}

/**
 * pipe from a readable source to minimal transform streams
 */
var t = new thr(function (msg, _, cb){
  process.stdout.write('transformed: ' + msg + '\n'); //write to stdout stream
  this.emit('destroy');
  cb();
});

sub
  .pipe(new thr(function (msg, _, cb){
    console.log('original: ' + msg);  //original: hello from nanømsg
    this.push(msg + ' and cheers!');
    return cb();
  }))
  .pipe(t);

pub.send('hello from nanømsg');

t.on('destroy', cleanup); //do some cleanup
function cleanup(){
  return sub.close();
}
