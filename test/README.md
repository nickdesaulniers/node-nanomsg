# Test suite for node-nanomsg

## Tests that can share a process
Most of the tests in this top-level directory can co-exist within the same process, therefore they can be run
by eg a single instance of `tape`.

## Tests that **cannot** share a single process
Some tests need to make use of the `nano.Term()` method, which causes the underlying libnanomsg C library to
shutdown, irretrievably.

Obviously, this will cause any following tests to fail.

To mitigate against this, any test that requires this functionality must exist as a separate file in the 
*standalone* directory.

These tests may be run individually using `tape`, but they will not play nicely with other tests.

`nano.Term()` is not meant to be used from practical applications. If it is
called before closing all Socket objects, libuv will issue a SIGABRT, closing
your process.  To work around this, you must keep a list of every Socket ever
created, and call `.close()` on all of them before it is safe to call
`nano.Term()`. The library could do this, to keep you from shooting yourself
in the foot, but that would make the Sockets effectively leak as the GC would
never clean them up.  If you're using `nn.Term()`, then you'd better be keeping
a list of all constructed Socket objects.


## I just want to run all the tests

Use a TAP compatible test harness, such as *faucet* or *tapper*. We use *tapper* by default, so you can
run the entire test suite from the project directory with:

```
npm test
```


