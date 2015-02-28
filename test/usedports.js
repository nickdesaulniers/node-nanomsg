// http://tim.dysinger.net/posts/2013-09-16-getting-started-with-nanomsg.html

var assert = require('assert');
var should = require('should');
var nano = require('../');

var test = require('tape');

test('inproc socket survey', function (t) {
    t.plan(3);

    var sur = nano.socket('surveyor');
    sur.bind('tcp://127.0.0.1:22');
    sur.on('error', function () {
        t.ok(true, 'privileged port throws error');
    })

    var run = nano.socket('surveyor');
    run.bind('tcp://127.0.0.1:6557');
    run.on('listening', function () {
        t.ok(true, 'can bind to 6557');

        setTimeout(function () {
        var run2 = nano.socket('surveyor');
        run2.bind('tcp://127.0.0.1:6557');
        run2.on('error', function () {
            t.ok(true, 'cannot bind to 6557 twice');
        });
        }, 1000);
    })
});
