// https://github.com/chuckremes/nn-core/blob/master/spec/nn_term_spec.rb

var assert = require('assert');
var should = require('should');
var nano = require('../../');
//var nn = nano._bindings;

var test = require('tape');


test('throw exception when seding on socket after term() called', function (t) {
    t.plan(1);

    var sock = nano.socket('pub');
    nano.term();

    sock.on('error', function (err) {
    	console.log(err);
        t.ok('error was thrown on send after term');
        sock.close();
    });

    sock.send("Hello");

});


