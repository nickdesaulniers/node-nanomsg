'use strict';

exports.createMsg = function(msgType, sz) {
  var buf;
  switch (msgType) {
    case '--buffer':
      buf = new Buffer(sz);
      buf.fill('o');
      break;
    case '--string':
      buf = new Array(sz + 1).join('o');
      break;
    default:
      console.err('Unspecified msg type not supported, please use --buffer or --string.');
      process.exit(1);
  }
  return buf;
}
