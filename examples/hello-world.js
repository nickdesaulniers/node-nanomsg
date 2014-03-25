var lda = require('../lib/dtrace-async');
var vasync = require('vasync');
var prog = 'BEGIN{ trace("hello, world"); }';
var consumer;

vasync.pipeline({
    'funcs': [
	function setup(_, callback) {
		consumer = lda.createConsumer();
		console.log('dtrace version: ', consumer.version());
		consumer.on('ready', callback);
	},
	function compile(_, callback) {
		console.log('consumer ready, compiling');
		consumer.strcompile(prog, callback);
	},
	function enable(_, callback) {
		console.log('compiled, enabling');
		consumer.go(callback);
	},
	function consume(_, callback) {
		console.log('enabled, consuming');
		consumer.consume(function (probe, value) {
			if (!value)
				return;
			console.log('consume: ', value.data);
		});
		consumer.stop(callback);
	}
    ]
}, function (err) {
	if (err)
		throw (err);
	console.log('stopped');
});
