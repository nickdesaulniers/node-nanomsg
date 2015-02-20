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
  t.equal( sock.linger(), 3000, 'sock.linger() gets: 3000');
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
  t.equal( sock.linger(), 5000, 'sock.linger() gets: 5000');

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

  sock.close();
  t.end();
})
