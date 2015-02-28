.PHONY: clean check test perf bench net udp full

ALL:
	git submodule update --init
	npm i

check:
	npm i && npm t

test:
	npm t

clean:
	rm -fr build && rm -rf node_modules

perf:
	node perf/local_lat.js tcp://127.0.0.1:5555 1 100000& node perf/remote_lat.js tcp://127.0.0.1:5555 1 100000 && wait
	node perf/local_thr.js tcp://127.0.0.1:5556 1 100000& node perf/remote_thr.js tcp://127.0.0.1:5556 1 100000 && wait

bench:
	node perf/local_lat.js tcp://127.0.0.1:5555 10 1000& node perf/remote_lat.js tcp://127.0.0.1:5555 10 1000 && wait
	node perf/local_thr.js tcp://127.0.0.1:5556 10 100000& node perf/remote_thr.js tcp://127.0.0.1:5556 10 100000 && wait

net:
	node perf/net/local_lat.js tcp://127.0.0.1:45557 1 100000& node perf/net/remote_lat.js tcp://127.0.0.1:45557 1 100000 && wait
	node perf/net/local_thr.js tcp://127.0.0.1:45558 1 100000& node perf/net/remote_thr.js tcp://127.0.0.1:45558 1 100000 && wait

udp:
	node perf/udp/local_thr.js udp://localhost:5559 6000 10000& node perf/udp/remote_thr.js udp://localhost:5559 6000 10000 && wait

full:
	git submodule update --init
	rm -fr build && rm -rf node_modules
	npm i && npm t
