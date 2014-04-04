# nanomsg for node

[![Build status](https://ci.appveyor.com/api/projects/status/07j7o9juuktas2uk)](https://ci.appveyor.com/project/tcr/node-nanomsg) [![Build Status](https://travis-ci.org/tcr/node-nanomsg.svg)](https://travis-ci.org/tcr/node-nanomsg)

Install:

```
npm install nanomsg
```

check it out:

```js
var nano = require('nanomsg');

var pub = nano.socket('pub');
var sub = nano.socket('sub');

var addr = 'tcp://127.0.0.1:7789'
pub.bind(addr);
sub.connect(addr);

sub.on('message', function (buf) {
	console.log(buf.toString());
	pub.close();
	sub.close();
});

setTimeout(function () {
	pub.send("Hello from nanomsg!");
}, 100);
```

## contributing

Issues and pull requests welcome!

Note: you must `git submodule update --init` to initialize the nanomsg repository.

# license

MIT
