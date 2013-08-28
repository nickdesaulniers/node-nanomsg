assert = require 'assert'
nanomsg = require '../lib/nanomsg.js'

{ AF_SP, NN_PAIR } = nanomsg

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

assert msg.toString() is recv.toString(), 'received message did not match sent'

