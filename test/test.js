var assert = require('assert');
var should = require('chai').should();
var expect = require('chai').expect;
var nano = require('../');

describe('nanomsg', function () {
  it('bindings should exist', function () {
    var AF_SP, NN_PAIR, msg, recv, ret, s1, s2;
    
    nano._bindings.AF_SP.should.be.at.least(0);
    nano._bindings.NN_PAIR.should.be.at.least(0);
  });


  it('pubsub test', function () {
    var nano = require('../');

    var pub = nano.socket('pub').on('error', function (err) { throw err; });
    var sub = nano.socket('sub').on('error', function (err) { throw err; });

    var addr = 'inproc://a';
    var msg = 'hello world';

    pub.bind(addr);
    sub.connect(addr);

    sub.on('message', function (buf) {
      buf.toString().should.equal(msg);
      pub.close();
      sub.close();
    });

    setTimeout(function () {
      pub.send(msg);
    }, 100);
  });


  it('pair test', function () {
    var nano = require('../');

    var s1 = nano.socket('pair').on('error', function (err) { throw err; });
    var s2 = nano.socket('pair').on('error', function (err) { throw err; });

    var addr = 'inproc://b';
    var msg = 'hello world';

    s1.bind(addr);
    s2.connect(addr);

    s1.on('message', function (buf) {
      buf.toString().should.equal(msg);
      s1.close();
      s2.close();
    });

    setTimeout(function () {
      s2.send(msg);
    }, 100);
  });


  it('multiple binds on same address', function () {
    var nano = require('../');

    var s1 = nano.socket('pair');
    var s2 = nano.socket('pair');

    var addr = 'inproc://c';

    function fn () {
      s2.on('error', function (err) {
        s1.close();
        s2.close();
        throw err;
      })

      s1.bind(addr);
      s2.bind(addr);
    }

    expect(fn).to.throw(Error);
  });
});
