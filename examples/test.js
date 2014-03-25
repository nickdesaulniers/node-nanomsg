var lda = require('../lib/dtrace-async');

var consumer = lda.createConsumer();
console.log('dtrace version: ', consumer.version());
consumer.on('ready', function () {
	console.log('consumer is ready');
	consumer.strcompile('BEGIN{ trace("hello"); }', function (err) {
		if (err) {
			console.error(err);
			return;
		}

		console.log('compiled');
		consumer.go(function (err2) {
			if (err2) {
				console.error(err2);
				return;
			}

			console.log('enabled');
			var consumed = false;
			var t = setInterval(function () {
				console.log('consuming');
				consumer.consume(function (probe, value) {
					console.log('consume: ', probe, value);
					consumed = true;
				});

				if (consumed) {
					clearInterval(t);
					process.nextTick(function () {
					/*
					 * XXX if we don't call stop, shouldn't
					 * we be holding the event loop open?
					 */
					consumer.stop(function (err3) {
						if (err3)
							console.error(err3);
					});
					});
				}
			}, 100);
		});
	});
});
