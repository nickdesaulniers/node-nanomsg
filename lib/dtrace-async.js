/*
 * lib/dtrace-async.js: public interface for the async libdtrace binding.  This
 * provides an object wrapper around the low-level native binding, which is not
 * directly exposed to users.
 */
var binding = require('bindings')('mymodule.node');

console.log(binding.foobar())