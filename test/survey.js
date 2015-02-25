// http://tim.dysinger.net/posts/2013-09-16-getting-started-with-nanomsg.html

var nano = require('../');
var test = require('tape');

test('inproc socket survey', function (t) {
    t.plan(4);

    var sur = nano.socket('surveyor');
    var rep1 = nano.socket('respondent');
    var rep2 = nano.socket('respondent');
    var rep3 = nano.socket('respondent');

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

    rep1.on('data', answer);
    rep2.on('data', answer);
    rep3.on('data', answer);

    var count = 0;
    sur.survey(msg1, function (res) {
        t.ok(res.length == 3);
        t.ok(res[0] == msg2);
        t.ok(res[1] == msg2);
        t.ok(res[2] == msg2);

        sur.close();
        rep1.close();
        rep2.close();
        rep3.close();
    })
});
