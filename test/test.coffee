assert = require 'assert'
should = require('chai').should()
nanomsg = require '../lib/nanomsg.js'

describe 'nanomsg', ->
  it 'should at least work', ->
    { AF_SP, NN_PAIR } = nanomsg

    s1 = nanomsg.nn_socket AF_SP, NN_PAIR
    s1.should.be.at.least 0

    ret = nanomsg.nn_bind s1, 'inproc://a'
    ret.should.be.above 0

    s2 = nanomsg.nn_socket AF_SP, NN_PAIR
    s2.should.be.at.least 0

    ret = nanomsg.nn_connect s2, 'inproc://a'
    ret.should.be.above 0

    msg = new Buffer 'hello'
    ret = nanomsg.nn_send s2, msg, msg.length, 0
    ret.should.be.above 0

    recv = new Buffer msg.length
    ret = nanomsg.nn_recv s1, recv, recv.length, 0
    ret.should.be.above 0

    msg.toString().should.equal recv.toString()

