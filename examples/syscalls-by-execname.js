var lda = require('../lib/dtrace-async');
var sys = require('sys');
var dtp = lda.createConsumer();
var prog = 'syscall:::entry { @[execname] = count(); }';

var syscalls = {};
var keys = [];

var pad = function (val, len)
{
	var rval = '', i, str = val + '';

	for (i = 0; i < Math.abs(len) - str.length; i++)
		rval += ' ';

	rval = len < 0 ? str + rval : rval + str;

	return (rval);
};

dtp.on('ready', function () {
	console.log('dtp is ready');
	dtp.strcompile(prog, function (err) {
		if (err) {
			console.error(err);
			return;
		}

		console.log('compiled');
		dtp.go(function (err2) {
			if (err2) {
				console.error(err2);
				return;
			}

			console.log('enabled');
			setInterval(tick, 1000);
		});
	});
});

function tick()
{
	var i;

	sys.puts(pad('EXECNAME', -40) + pad('COUNT', -10));

	dtp.aggwalk(function (id, key, val) {
		if (!syscalls.hasOwnProperty(key[0]))
			keys.push(key[0]);

		syscalls[key[0]] = val;
	});

	keys.sort();

	for (i = 0; i < keys.length; i++) {
		sys.puts(pad(keys[i], -40) + pad(syscalls[keys[i]], -10));
		syscalls[keys[i]] = 0;
	}

	sys.puts('');
}
