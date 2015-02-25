var nano = require('..');
var test = require('tape');

test('adding and removing subscription channels', function (t) {

  t.plan(7);

  var pub = nano.socket('pub');

  //register some channels: hello, foo, bar
  var sub = nano.socket('sub', {
    chan: ['hello', 'foo', 'bar']
  });

  pub.bind('inproc://filter');
  sub.connect('inproc://filter');

  //the main array we'll use to test channel registration and removal
  var msgs = ['hello world','hello world','hello world','bar world','foo world'];
  var msgqty = -1; //starting here so first msg counted can be zero
  var sent = 0;

  sub.on('data', function (buf) {

    var msg = String(buf);

    //increment msgqty when a msg is received (happening about every 100ms)
    //we'll call finish() on the 5th msg received
    switch(++msgqty){
      case 0: return t.equal(msg, msgs[msgqty]); //msgs[0], 'hello world'
      case 1: return t.equal(msg, msgs[msgqty]); //msgs[1], 'hello world'
      case 2: return t.equal(msg, msgs[msgqty]); //msgs[2], 'hello world'
      case 3: return t.equal(msg, msgs[msgqty]); //msgs[3], 'bar world'
      case 4: return finish (msg);
    }

  });

  setTimeout(send,        0);   //send msgs[0], 'hello world'
  setTimeout(send,        100); //send msgs[1], 'hello world'
  setTimeout(send,        200); //send msgs[2], 'hello world'
  setTimeout(removeHello, 300); //send msgs[3], 'bar world' and remove hello
  setTimeout(send,        400); //send msgs[4], 'foo world'

  function send(){
    pub.send(msgs[sent++]); //lazy incrementing
  }

  function removeHello(){

    //stop listening for msg prefix: hello
    sub.rmchan('hello');

    //publish about 10 extra hello worlds to see if we can increment msgqty
    var i = 0;
    while(i++ < 10) pub.send('hello world');

    send(); // send something with a registered prefix: 'bar world'
  }

  function finish(msg){
    t.equal(msg, msgs[msgqty]); //'foo world'
    t.equal(msg, msgs[4]); //msgqty count
    t.equal(msg, 'foo world'); //prove case 4, the fifth msg
    sub.close();
    pub.close();
  }
});

test('without explicitly registering any channels, socket recvs 2+ msgs of different prefixes', function(t){
  t.plan(2);

  var pub = nano.socket('pub');
  var sub = nano.socket('sub');

  var msgs = 0;
  var msg1 = 'foo world';
  var msg2 = 'bar world';
  var addr = 'inproc://default';

  pub.bind(addr);
  sub.connect(addr);

  sub.on('data', function (buf) {

    var msg = String(buf);

    if(++msgs < 2){
      t.equal(msg, 'foo world');
    } else {
      t.equal(msg, 'bar world');
      sub.close();
      pub.close();
    }
  });

  pub.send(msg1);

  setTimeout(function () {
    pub.send(msg2);
  }, 100);

});

test('registration after socket creation: chan receives correctly prefixed messages but not others', function(t){
  t.plan(2);

  var pub = nano.socket('pub');
  var sub = nano.socket('sub');

  var msgs = 0;
  var msg1 = 'foo world';
  var msg2 = 'bar world';
  var msg3 = 'hi world';
  var msg4 = 'hello world';
  var addr = 'inproc://prefixed';

  pub.bind(addr);
  sub.connect(addr);

  sub.chan(['foo','hello']);

  sub.on('data', function (buf) {

    var msg = String(buf);

    if(++msgs < 2){
      t.equal(msg, 'foo world');
    } else {
      t.equal(msg, 'hello world');
      sub.close();
      pub.close();
    }
  });

  pub.send(msg1);
  pub.send(msg2);
  pub.send(msg3);
  process.nextTick(function(){
    pub.send(msg4);
  })
});

test('channels registered by constructor get appropriately prefixed messages but not others', function(t){
  t.plan(2);

  var pub = nano.socket('pub');
  var sub = nano.socket('sub',{
    chan: ['foo','hello']
  });

  var msgs = 0;
  var msg1 = 'foo world';
  var msg2 = 'bar world';
  var msg3 = 'hi world';
  var msg4 = 'hello world';
  var addr = 'inproc://prefixed';

  pub.bind(addr);
  sub.connect(addr);

  sub.on('data', function (buf) {

    var msg = String(buf);

    if(++msgs < 2){
      t.equal(msg, 'foo world');
    } else {
      t.equal(msg, 'hello world');
      sub.close();
      pub.close();
    }
  });

  pub.send(msg1);
  pub.send(msg2);
  pub.send(msg3);
  process.nextTick(function(){
    pub.send(msg4);
  })
});

test('multi-topic registration followed by calls to rmchan on all but one stops all channels no longer registerd', function(t){
  t.plan(5);

  var pub = nano.socket('pub');
  var sub = nano.socket('sub',{
    chan: ['foo','bar','hi','hello']
  });

  var msgs = 0;
  var msg1 = 'foo world';
  var msg2 = 'bar world';
  var msg3 = 'hi world';
  var msg4 = 'hello world';
  var addr = 'inproc://prefixed';

  pub.bind(addr);
  sub.connect(addr);

  sub.on('data', function (buf) {

    var msg = String(buf);

    if(++msgs === 1) {
      t.equal(msg, 'foo world');
      sub.rmchan('foo')
    } else if(msgs === 2) {
      t.equal(msg, 'bar world');
      sub.rmchan('bar');
    } else if (msgs === 3) {
      t.equal(msg, 'hi world');
      sub.rmchan('hi');
    } else if (msgs === 4) {
      t.equal(msg, 'hello world');
    } else if (msgs === 5) {
      t.equal(msg, 'hello world');
      sub.close();
      pub.close();
    }
  });

  pub.send(msg1); // 1st msg
  process.nextTick(function(){
    pub.send(msg2); // 2nd msg
    pub.send(msg1);
    process.nextTick(function(){
      pub.send(msg3); // 3rd msg
      pub.send(msg2);
      pub.send(msg1);
      process.nextTick(function(){
        pub.send(msg4); // 4th msg
        pub.send(msg3);
        pub.send(msg2);
        pub.send(msg1);
        process.nextTick(function(){
          pub.send(msg3);
          pub.send(msg2);
          pub.send(msg1);
          process.nextTick(function(){
            pub.send(msg4); //5th msg recv'd ends test
          });
        });
      });
    });
  });
});
