# nanomsg for node

Install:

```
npm install nanomsg
```

check it out:

```
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

Issues and pull requests welcome.

Note: you must `git submodule init` and `git submodule update` to initialize the nanomsg repository.

# license

MIT
