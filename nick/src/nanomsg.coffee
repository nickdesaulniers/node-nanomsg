ffi = require 'ffi'

exports = module.exports = ffi.Library 'libnanomsg',
  nn_socket: [ 'int', [ 'int', 'int' ]]
  nn_bind: [ 'int', [ 'int', 'string' ]]
  nn_connect: [ 'int', ['int', 'string' ]]
  nn_send: [ 'int', ['int', 'pointer', 'int', 'int']]
  nn_recv: [ 'int', ['int', 'pointer', 'int', 'int']]
  nn_errno: [ 'int', []]

exports.AF_SP = 1
exports.NN_PAIR = 16
