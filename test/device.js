var assert = require('assert');
var should = require('should');
var nano = require('../');

var test = require('tape');

test('create device with two sockets', function(t) {
    t.plan(5);

    var r1 = nano.rawSocket('pair');
    var r2 = nano.rawSocket('pair');

    var addr1 = 'inproc://device1';
    var addr2 = 'inproc://device2';
    var msg1 = "Hello";
    var msg2 = "World";

    r1.bind(addr1);
    r2.bind(addr2);

    var d = nano.device(r1, r2);

    d.on('error', function(err) {
        t.ok(err, 'error was thrown when device collapsed:' + err);
        //r1.close();
        //r2.close();
    });


    var s1 = nano.socket('pair');
    var s2 = nano.socket('pair');

    s1.connect(addr1);
    s2.connect(addr2);

    s1.on('message', function(buf) {
        console.log("s1 received msg2");
        t.equal(buf.toString(), msg2);
        nano.term();
    });

    s2.on('message', function(buf) {
        console.log("s2 received msg1");
        t.equal(buf.toString(), msg1);
        console.log("s2 sending msg2");
        s2.send(msg2);
    });

    s1.on('error', function(err) {
        t.ok(err, 'error thrown when s1 terminated');
        s1.close();
    });

    s2.on('error', function(err) {
        t.ok(err, 'error thrown when s2 terminated');
        s2.close();
    });


    setTimeout(function() {
        console.log("s1 sending msg1");
        s1.send(msg1);
    }, 100);

});
