var nano  = require('..');
var test  = require('tape');
var pubs  = {
  p1      : nano.socket('pub'),
  p2      : nano.socket('pub'),
  p3      : nano.socket('pub'),
  p4      : nano.socket('pub'),
  p5      : nano.socket('pub')
}
var sub   = nano.socket('sub');
var addr  = 'tcp://127.0.0.1:4445';

test('bind five heterogeneous pub connections to a subscriber', function(t){

  var i = 0;

  //bind/connect five pubs to one sub from tcp ports 44451 to 44455
  while(++i <= 5) pubs['p'+i].bind( addr + i);
  while(--i > 0) sub.connect( addr + i);

  //verify connection addresses known by publishers
  while(++i <= 5) t.ok(has(pubs['p'+i],'bound'),'pub p'+i+' \'eid\' property check');
  while(i-- > 1) t.ok(has(pubs['p'+i].bound, addr+i ),'pub p'+i+' addr: '+ addr+i);

  t.end();

})

test('shutdown the sub\'s connections',function(t){

  t.equal(Object.keys(sub.connected).length, 5, 'subscriber connections: 5');

  function checkThenCleanUp (previousSubs, newSubs, msg) {
    // After every shutdown, we should have decremented the number of
    // subscribers.
    t.equal(newSubs, previousSubs - 1, msg);
    // It's only safe to clean up after the number of subscribers has hit zero.
    if (newSubs !== 0) {
      return;
    }
    clearInterval(pubInterval);
    for(var p in pubs) pubs[p].close();
    sub.close();
    t.end();
  };

  function numSubs (sub) { return Object.keys(sub.connected).length; }
  var i = 0;

  sub.on('data', function(msg){

    switch (String(msg)) {

      // After 10 messages from p1, shutdown everyone
      case 'hello from p1': if (++i == 10) {

        var previousSubs = numSubs(sub);
        t.ok(sub.shutdown(addr+1) != -1,
          'shutting down connection to endpoint: tcp://127.0.0.1:44451\n');
        var newSubs = numSubs(sub);
        checkThenCleanUp(previousSubs, newSubs, 'shutting down p1');

      } break;

      case 'hello from p2': if (i == 10) {

        var previousSubs = numSubs(sub);
        t.ok(sub.shutdown(addr+2) != -1,
          Object.keys(sub.connected).length+1,
          'shutting down connection to endpoint: tcp://127.0.0.1:44452\n');
        var newSubs = numSubs(sub);
        checkThenCleanUp(previousSubs, newSubs, 'shutting down p2');

      } break;

      case 'hello from p3': if (i == 10) {

        var previousSubs = numSubs(sub);
        t.ok(sub.shutdown(addr+3) != -1,
          Object.keys(sub.connected).length+1,
          'shutting down connection to endpoint: tcp://127.0.0.1:44453\n');
        var newSubs = numSubs(sub);
        checkThenCleanUp(previousSubs, newSubs, 'shutting down p3');

      } break;

      case 'hello from p4': if (i == 10) {

        var previousSubs = numSubs(sub);
        t.ok(sub.shutdown(addr+4) != -1,
          Object.keys(sub.connected).length+1,
          'shutting down connection to endpoint: tcp://127.0.0.1:44454\n');
        var newSubs = numSubs(sub);
        checkThenCleanUp(previousSubs, newSubs, 'shutting down p4');

      } break;

      case 'hello from p5': if (i == 10) {

        var previousSubs = numSubs(sub);
        t.ok(sub.shutdown(addr+5) != -1,
          Object.keys(sub.connected).length+1,
          'shutting down connection to endpoint: tcp://127.0.0.1:44455');
        var newSubs = numSubs(sub);
        checkThenCleanUp(previousSubs, newSubs, 'shutting down p5');

      } break;
    }

  })

  // Publish another five hellos after 5ms.
  var pubInterval = setInterval(hellos, 5);

  function hellos(){
    pubs.p1.send('hello from p1');
    pubs.p2.send('hello from p2');
    pubs.p3.send('hello from p3');
    pubs.p4.send('hello from p4');
    pubs.p5.send('hello from p5');
  }

});


function has (obj, prop) {
  return Object.hasOwnProperty.call(obj, prop);
}
