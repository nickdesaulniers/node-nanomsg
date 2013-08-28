ffi = require 'ffi'
assert = require 'assert'

AF_SP = 1
NN_PAIR = 16

nanomsg = ffi.Library 'libnanomsg',
  nn_socket: [ 'int', [ 'int', 'int' ]]
  nn_bind: [ 'int', [ 'int', 'string' ]]
  nn_connect: [ 'int', ['int', 'string' ]]
  nn_send: [ 'int', ['int', 'pointer', 'int', 'int']]
  nn_recv: [ 'int', ['int', 'pointer', 'int', 'int']]
  nn_errno: [ 'int', []]

# test
s1 = nanomsg.nn_socket AF_SP, NN_PAIR
assert s1 >= 0, 's1: ' + nanomsg.nn_errno()

ret = nanomsg.nn_bind s1, 'inproc://a'
assert ret > 0, 'bind'

s2 = nanomsg.nn_socket AF_SP, NN_PAIR
assert s2 >= 0, 's2: ' + nanomsg.nn_errno()

ret = nanomsg.nn_connect s2, 'inproc://a'
assert ret > 0, 'connect'

msg = new Buffer 'hello'
ret = nanomsg.nn_send s2, msg, msg.length, 0
assert ret > 0, 'send'

recv = new Buffer msg.length
ret = nanomsg.nn_recv s1, recv, recv.length, 0
assert ret > 0, 'recv'

console.log recv.toString()
assert msg.toString() is recv.toString(), 'received message did not match sent'

