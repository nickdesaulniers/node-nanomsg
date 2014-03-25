var mod_util = require('util');

/* Public interface */
module.exports = makeBindingWrapper;

/*
 * Builds a wrapper method for a function provided by the underlying binding.
 * The implementation invokes "method_name" on the binding object, stored in
 * this[binding_prop].  If "precond" is non-null, it's invoked before anything
 * else happens to check a precondition (and throw on failure).  "proto_args" is
 * an array of type names that will be checked against the actual arguments'
 * types.
 */
function makeBindingWrapper(binding, binding_prop, method_name, precond,
    proto_args)
{
	return (function () {
		var args;

		if (precond !== null)
			precond.call(this);

		args = Array.prototype.slice.call(arguments);
		proto_args.forEach(function (expected_type, i) {
			var actual = typeof (args[i]);

			if (actual == expected_type)
				return;

			throw (new Error(mod_util.format(
			    '%s: arg%s: expected type "%s" (found "%s")',
			    method_name, i, expected_type, actual)));
		});

		args.unshift(this[binding_prop]);
		return (binding[method_name].apply(null, args));
	});
}
