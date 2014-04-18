// http://tim.dysinger.net/posts/2013-09-16-getting-started-with-nanomsg.html

var assert = require('assert');
var should = require('should');
var nano = require('../');
var nn = nano._bindings;
var fs = require('fs');

var test = require('tape');

test('inproc socket survey', function (t) {
    t.plan(3);

    var sur = nano.socket('surveyor');
    sur.name = 'survey'
    var rep1 = nano.socket('respondent');
    rep1.name = 'rep1'
    var rep2 = nano.socket('respondent');
    rep2.name = 'rep2'
    var rep3 = nano.socket('respondent');
    rep3.name = 'rep3'

    var addr = 'inproc://survey';
    var msg1 = 'knock knock';
    var msg2 = "who's there?";

    sur.bind(addr);
    rep1.connect(addr);
    rep2.connect(addr);
    rep3.connect(addr);

    function answer (buf) {
        this.send(msg2);
    }

    rep1.on('message', answer);
    rep2.on('message', answer);
    rep3.on('message', answer);

    var count = 0;
    console.log('msg');
    sur.on('message', function (buf) {
        t.ok(buf.toString() == msg2, buf.toString() + ' == ' + msg2);

        if (++count == 3) {
            sur.close();
            rep1.close();
            rep2.close();
            rep3.close();
        }
    });

    setTimeout(function () {
        sur.send(msg1);
    }, 100);
});