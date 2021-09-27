'use strict';

var buffer_alloc = require('buffer-alloc')

exports.createMsg = function(msgType, sz) {
  var buf;
  switch (msgType) {
    case '--buffer':
      buf = buffer_alloc(sz, 'o');
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
