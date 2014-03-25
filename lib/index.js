/*
 * lib/dtrace-async.js: public interface for the async libdtrace binding.  This
 * provides an object wrapper around the low-level native binding, which is not
 * directly exposed to users.
 */
var binding = require('bindings')('node_nanomsg.node');

console.log(binding.foobar())
console.log(binding.socket(binding.AF_SP, binding.NN_PULL))