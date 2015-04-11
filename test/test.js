// http://tim.dysinger.net/posts/2013-09-16-getting-started-with-nanomsg.html

var nano = require('../');
var test = require('tape');

test('bindings should exist', function (t) {
    t.plan(2);

    t.equal(typeof nano._bindings.AF_SP, 'number', 'AF_SP is a number')
    t.equal(typeof nano._bindings.NN_PAIR, 'number', 'NN_PAIR is a number');
});



