var lda = require('../lib/dtrace-async');
var sys = require('sys');
var dtp = lda.createConsumer();
var prog = [
    'syscall:::entry { self->f = vtimestamp; }',
    'syscall:::return/self->f/{ @[execname] = quantize(',
    'vtimestamp - self->f); self->f = 0; }'
].join('\n');

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
	var i, j, val;

	dtp.aggwalk(function (id, key, aggval) {
		if (!syscalls.hasOwnProperty(key[0]))
			keys.push(key[0]);

		syscalls[key[0]] = aggval;
	});

	keys.sort();

	for (i = 0; i < keys.length; i++) {
		val = syscalls[keys[i]];
		if (val.length === 0)
			continue;

		console.log(pad(keys[i], -40));
		for (j = 0; j < val.length; j++) {
			console.log('[ ' +
			    pad(val[j][0][0], -6) + ', ' +
			    pad(val[j][0][1], -6) + '] ' +
			    pad(val[j][1], -6));
		}

		syscalls[keys[i]] = [];
	}

	sys.puts('');
}
