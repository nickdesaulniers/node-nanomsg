.PHONY: clean check test perf bench full

ALL:
	git submodule update --init
	npm i

use_system_libnanomsg:
	npm i --use_system_libnanomsg=true

check:
	rm -f some_address /tmp/*.ipc
	find test/*.js test/standalone/*.js | xargs -n 1 node | node_modules/tap-difflet/bin/tap-difflet
	rm -f some_address /tmp/*.ipc

test:
	find test/*.js test/standalone/*.js | xargs -n 1 node | node_modules/tap-nyan/bin/cmd.js

clean:
	rm -fr build && rm -rf node_modules

perf:
	node perf/local_lat.js tcp://127.0.0.1:5555 1 100000& node perf/remote_lat.js tcp://127.0.0.1:5555 1 100000 && wait
	node perf/local_thr.js tcp://127.0.0.1:5556 1 100000& node perf/remote_thr.js tcp://127.0.0.1:5556 1 100000 && wait

bench:
	node perf/local_lat.js tcp://127.0.0.1:5555 10 10000& node perf/remote_lat.js tcp://127.0.0.1:5555 10 10000 && wait
	node perf/local_thr.js tcp://127.0.0.1:5556 10 100000& node perf/remote_thr.js tcp://127.0.0.1:5556 10 100000 && wait

full: clean ALL test

use_system_libnanomsg-full: clean use_system_libnanomsg test
