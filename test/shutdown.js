// https://github.com/chuckremes/nn-core/blob/master/spec/nn_shutdown_spec.rb

var assert = require('assert');
var should = require('should');
var nano = require('../');
var nn = nano._bindings;

var test = require('tape');

test('shutdown on valid endpoint returns 0', function(t) {
    t.plan(1);

    var sock = nano.socket('pub');
    var ep = sock.bind('inproc://some_endpoint');
    var rc = sock.shutdown(ep);
    t.equal(rc, 0);
    sock.close();
});

test('shutdown on invalid endpoint throws exception', function(t) {
    t.plan(2);

    var sock = nano.socket('pub');

    sock.on('error', function(err) {
        t.ok(err, 'exception thrown for shutdown on invalid endpoint');
        t.equal(nn.Errno(), nn.EINVAL);
        sock.close();
    });

    sock.shutdown(0);
});

        //context "given an invalid endpoint" do
          //it "returns -1 and set nn_errno to EINVAL" do
            //rc = LibNanomsg.nn_shutdown(@socket, 0)
            //rc.should == -1
            //LibNanomsg.nn_errno.should == EINVAL
          //end
        //end
      //end

      //context "given an invalid socket" do

        //it "returns -1 and sets nn_errno to EBADF" do
          //rc = LibNanomsg.nn_shutdown(0, 0)
          //rc.should == -1
          //LibNanomsg.nn_errno.should == EBADF
        //end

      //end

    //end
  //end
//end
