var nano = require('..');
var test = require('tape');

test('sockopt api methods', function(t){

  //set sockopts when starting the socket
  var sock = nano.socket('push', {
    tcpnodelay:true,
    linger: 3000,
    sndbuf: 202400
  });
  t.equal( sock.tcpnodelay(), true, 'sock.tcpnodelay() gets: true');
  t.equal( sock.linger(), 0, 'sock.linger() gets: 0');
  t.equal( sock.sndbuf(), 202400, 'sock.sndbuf() gets: 202400');
  sock.tcpnodelay(false);


  //`socket.tcpnodelay()` method
  t.equal( sock.tcpnodelay(), false, 'sock.tcpnodelay(): false');
  t.equal( sock.tcpnodelay(true), true, 'sock.tcpnodelay(true) set: true');
  t.equal( sock.tcpnodelay(), true, 'sock.tcpnodelay() gets: true');
  t.equal( sock.tcpnodelay(false), false,'sock.tcpnodelay(false) set: false');
  t.equal( sock.tcpnodelay(), false, 'sock.tcpnodelay() gets: false');

  //linger
  t.equal( sock.linger(5000), true, 'sock.linger(5000) sets: 5000ms');
  t.equal( sock.linger(), 0, 'sock.linger() gets: 0');

  //sndbuf
  t.equal( sock.sndbuf(1024), true, 'sock.sndbuf(1024) sets: 1024 bytes');
  t.equal( sock.sndbuf(), 1024, 'sock.sndbuf() gets: 1024');

  //rcvbuf
  t.equal( sock.rcvbuf(102400), true, 'sock.rcvbuf(102400) sets: 102400 bytes');
  t.equal( sock.rcvbuf(), 102400, 'sock.rcvbuf() gets: 102400');

  //sndtimeo
  t.equal( sock.sndtimeo(500), true, 'sock.sndtimeo(500) sets: 500ms');
  t.equal( sock.sndtimeo(), 500, 'sock.sndtimeo() gets: 500');

  //rcvtimeo
  t.equal( sock.rcvtimeo(200), true, 'sock.rcvtimeo(200) sets: 200ms');
  t.equal( sock.rcvtimeo(), 200, 'sock.rcvtimeo() gets: 200');

  //reconn
  t.equal( sock.reconn(500), true, 'sock.reconn(500) sets: 500ms');
  t.equal( sock.reconn(), 500, 'sock.reconn() gets: 500');

  //maxreconn
  t.equal( sock.maxreconn(100000), true, 'sock.maxreconn(100000) sets: 100000ms');
  t.equal( sock.maxreconn(), 100000, 'sock.maxreconn() gets: 100000');

  //sndprio
  t.equal( sock.sndprio(3), true, 'sock.sndprio(3) sets: 3 priority');
  t.equal( sock.sndprio(), 3, 'sock.sndprio() gets: 3');

  //rcvprio
  t.equal( sock.rcvprio(10), true, 'sock.rcvprio(10) sets: 10 priority');
  t.equal( sock.rcvprio(), 10, 'sock.rcvprio() gets: 10');

  //rcvmaxsize
  t.equal( sock.rcvmaxsize(), 1048576, 'rcvmaxsize default: 1048576 bytes');
  t.equal( sock.rcvmaxsize(10000000), true, 'rcvmaxsize sets: 1M bytes');
  t.equal( sock.rcvmaxsize(), 10000000, 'rcvmaxsize gets: 1M bytes');

  //ipv6
  t.equal( sock.ipv6(), false, 'sock.ipv6() gets: false');
  t.equal( sock.ipv6(true), true, 'sock.ipv6(true) gets: true');
  t.equal( sock.ipv6(), true, 'sock.ipv6() gets: true');

  //maxttl
  t.equal( sock.maxttl(), 8, 'sock.maxttl() gets: 8');
  t.equal( sock.maxttl(12), true, 'sock.maxttl(12) sets: 12');
  t.equal( sock.maxttl(), 12, 'sock.maxttl() gets: 12');

  //set WS socket msg type
  t.equal( sock.wsopt(), 'binary', 'sock.wsopt() gets: binary');
  t.equal( sock.wsopt('text'), true, 'sock.wsopt(text) sets: text');
  t.equal( sock.wsopt(), 'text', 'sock.wsopt() gets: text');
  t.equal( sock.wsopt('binary'), true, 'sock.wsopt(binary) sets: binary');
  t.equal( sock.wsopt(), 'binary', 'sock.wsopt() gets: binary');

  //get default dontwait option for push
  t.equal( sock.dontwait(), false, 'sock.dontwait() gets: false');

  //set dontwait option
  t.equal( sock.dontwait(true), true, 'sock.dontwait(true) sets: true');
  t.equal( sock.dontwait(), true, 'sock.dontwait(1) gets: true');

  //get default dontwait option for pull
  var pull = nano.socket('pull');
  t.equal( pull.dontwait(), true, 'sock.dontwait() gets: true');
  pull.close();

  sock.close();
  t.end();
});

test('ipv6 socket msg delivery', function (t) {
    t.plan(1);

    var ipv6 = [];
    var interfaces = require('os').networkInterfaces();
    for (var iface in interfaces) {
      ipv6.concat(interfaces[iface].filter(function fam(i){
        return i.family === 'IPv6';
      }));
      if (ipv6.length) {
        break;
      }
    }

    if (!ipv6.length) {
      t.ok('err', 'IPv6 ERROR: no loopback IPv6 address on this machine');
      return;
    }

    var pub = nano.socket('pub', { ipv6: true });
    var sub = nano.socket('sub', { ipv6: true });

    var addr = 'tcp://::1:6000';
    var msg = 'hello world';

    pub.bind(addr);
    sub.connect(addr);

    sub.on('data', function (buf) {
      t.equal(buf.toString(), msg);

      pub.close();
      sub.close();
    });

    setTimeout(function () {
      pub.send(msg);
    }, 100);
});
