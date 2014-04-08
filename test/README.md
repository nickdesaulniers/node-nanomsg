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


## I just want to run all the tests

Use a TAP compatible test harness, such as *faucet* or *tapper*. We use *tapper* by default, so you can
run the entire test suite from the project directory with:

```
npm test
```


