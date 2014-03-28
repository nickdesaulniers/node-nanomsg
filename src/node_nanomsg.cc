#include <stdio.h>
#include <stdlib.h>
#include <node.h>
#include "nan.h"

#include <nanomsg/nn.h>
#include <nanomsg/pubsub.h>
#include <nanomsg/pipeline.h>
#include <nanomsg/bus.h>
#include <nanomsg/pair.h>
#include <nanomsg/reqrep.h>

using namespace v8;


NAN_METHOD(Socket) {
  	NanScope();

	int domain = args[0]->Uint32Value();
	int protocol = args[1]->Uint32Value();

	// Invoke nanomsg function.
	int ret = nn_socket(domain, protocol);
	if(protocol == NN_SUB)
    	if (nn_setsockopt(domain, NN_SUB, NN_SUB_SUBSCRIBE, "", 0) != 0)
    		return NanThrowError("Could not set subscribe option.");;

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Close) {
  	NanScope();

	int s = args[0]->Uint32Value();

	// Invoke nanomsg function.
	int ret = nn_close(s);

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Setsockopt) {
  	NanScope();

	int s = args[0]->Uint32Value();
	int level = args[1]->Uint32Value();
	int option = args[2]->Uint32Value();
	int optval = args[3]->Uint32Value();

	// Invoke nanomsg function.
	int ret = nn_setsockopt(s, level, option, &optval, sizeof(optval));

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Getsockopt) {
  	NanScope();

	int s = args[0]->Uint32Value();
	int level = args[1]->Uint32Value();
	int option = args[2]->Uint32Value();
	int optval = args[3]->Uint32Value();

	// Invoke nanomsg function.
	size_t optsize = sizeof(optval);
 	int ret = nn_getsockopt(s, level, option, &optval, &optsize);
 	(void) ret;

 	// TODO this should return ret value too?
    NanReturnValue(Number::New(optval));
}


NAN_METHOD(Bind) {
  	NanScope();

	int s = args[0]->Uint32Value();
	size_t addr_len = 0;
	char* addr = NanCString(args[1], &addr_len);

	// Invoke nanomsg function.
	int ret = nn_bind(s, addr);

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Connect) {
  	NanScope();

	int s = args[0]->Uint32Value();
	size_t addr_len = 0;
	char* addr = NanCString(args[1], &addr_len);

	// Invoke nanomsg function.
	int ret = nn_connect(s, addr);

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Shutdown) {
  	NanScope();

	int s = args[0]->Uint32Value();
	int how = args[1]->Uint32Value();

	// Invoke nanomsg function.
	int ret = nn_shutdown(s, how);

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Send) {
  	NanScope();

	int s = args[0]->Uint32Value();
	if (!node::Buffer::HasInstance(args[1]))
		return NanThrowError("second Argument must be a Buffer.");
	Local<Object> obj = args[1]->ToObject();
	char* odata = node::Buffer::Data(obj);
	size_t odata_len = node::Buffer::Length(obj);
	int flags = args[2]->Uint32Value();

	// Invoke nanomsg function.
	int ret = nn_send(s, odata, odata_len, flags);

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Recv) {
  	NanScope();

	int s = args[0]->Uint32Value();
	int flags = args[1]->Uint32Value();

	// Invoke nanomsg function.
	void *retbuf = NULL;
	int ret = nn_recv(s, &retbuf, NN_MSG, flags);

	// TODO multiple return args
	if (ret > -1) {
    	NanReturnValue(NanNewBufferHandle((char*) retbuf, ret));
    } else {
    	NanReturnValue(Number::New(ret));
    }
}


NAN_METHOD(Errno) {
  	NanScope();

	// Invoke nanomsg function.
	int ret = nn_errno ();

    NanReturnValue(Number::New(ret));
}


NAN_METHOD(Strerr) {
  	NanScope();

  	int errnum = args[0]->Uint32Value();

	// Invoke nanomsg function.
	const char* err = nn_strerror (errnum);

    NanReturnValue(String::New(err));
}


class NanomsgPollWorker : public NanAsyncWorker {
 public:
  NanomsgPollWorker(NanCallback *callback, int s, int events)
    : NanAsyncWorker(callback), s(s), events(events) {}
  ~NanomsgPollWorker() {}

  // Executed inside the worker-thread.
  // It is not safe to access V8, or V8 data structures
  // here, so everything we need for input and output
  // should go on `this`.
  void Execute () {
    struct nn_pollfd fd = { 0, 0, 0 };
	fd.fd = s;
	fd.events = events;
	int rval = nn_poll (&fd, 1, 0);
	err = rval < 0 ? nn_errno() : 0;
	revents = fd.revents;
  }

  // Executed when the async work is complete
  // this function will be run inside the main event loop
  // so it is safe to use V8 again
  void HandleOKCallback () {
    NanScope();

    Local<Value> argv[] = {
        Number::New(err)
      , Number::New(revents)
    };

    callback->Call(2, argv);
  };

 private:
  int s;
  int events;
  int err;
  int revents;
};

// Asynchronous access to the `Estimate()` function
NAN_METHOD(NodeWorker) {
  NanScope();

  int s = args[0]->Uint32Value();
  int events = args[1]->Uint32Value();
  NanCallback *callback = new NanCallback(args[2].As<Function>());

  NanAsyncQueueWorker(new NanomsgPollWorker(callback, s, events));
  NanReturnUndefined();
}


#define EXPORT_METHOD(C, S) C->Set(NanSymbol(# S), FunctionTemplate::New(S)->GetFunction());
#define EXPORT_CONSTANT(C, S) C->Set(NanSymbol(# S), Number::New(S));

void InitAll(Handle<Object> exports) {
	// Export functions.
	EXPORT_METHOD(exports, Socket);
	EXPORT_METHOD(exports, Close);
	EXPORT_METHOD(exports, Setsockopt);
	EXPORT_METHOD(exports, Getsockopt);
	EXPORT_METHOD(exports, Bind);
	EXPORT_METHOD(exports, Connect);
	EXPORT_METHOD(exports, Shutdown);
	EXPORT_METHOD(exports, Send);
	EXPORT_METHOD(exports, Recv);
	EXPORT_METHOD(exports, Errno);
	EXPORT_METHOD(exports, Strerr);
	EXPORT_METHOD(exports, NodeWorker);

	// SP address families.
	EXPORT_CONSTANT(exports, AF_SP);
	EXPORT_CONSTANT(exports, AF_SP_RAW);

	// Socket option levels: Negative numbers are reserved for transports,
	// positive for socket types.
	EXPORT_CONSTANT(exports, NN_SOL_SOCKET);

	//  Generic socket options (NN_SOL_SOCKET level).
	EXPORT_CONSTANT(exports, NN_LINGER);
	EXPORT_CONSTANT(exports, NN_SNDBUF);
	EXPORT_CONSTANT(exports, NN_RCVBUF);
	EXPORT_CONSTANT(exports, NN_SNDTIMEO);
	EXPORT_CONSTANT(exports, NN_RCVTIMEO);
	EXPORT_CONSTANT(exports, NN_RECONNECT_IVL);
	EXPORT_CONSTANT(exports, NN_RECONNECT_IVL_MAX);
	EXPORT_CONSTANT(exports, NN_SNDPRIO);
	EXPORT_CONSTANT(exports, NN_SNDFD);
	EXPORT_CONSTANT(exports, NN_RCVFD);
	EXPORT_CONSTANT(exports, NN_DOMAIN);
	EXPORT_CONSTANT(exports, NN_PROTOCOL);
	EXPORT_CONSTANT(exports, NN_IPV4ONLY);

	// Send/recv options.
	EXPORT_CONSTANT(exports, NN_DONTWAIT);

	// Socket types
	EXPORT_CONSTANT(exports, NN_REQ);
	EXPORT_CONSTANT(exports, NN_REP);
	EXPORT_CONSTANT(exports, NN_PAIR);
	EXPORT_CONSTANT(exports, NN_PUSH);
	EXPORT_CONSTANT(exports, NN_PULL);
	EXPORT_CONSTANT(exports, NN_PUB);
	EXPORT_CONSTANT(exports, NN_SUB);
	EXPORT_CONSTANT(exports, NN_BUS);
	EXPORT_CONSTANT(exports, NN_SURVEYOR);
	EXPORT_CONSTANT(exports, NN_RESPONDENT);

	// Socket type options.
	EXPORT_CONSTANT(exports, NN_REQ_RESEND_IVL);
	EXPORT_CONSTANT(exports, NN_SUB_SUBSCRIBE);
	EXPORT_CONSTANT(exports, NN_SUB_UNSUBSCRIBE);
	EXPORT_CONSTANT(exports, NN_SURVEYOR_DEADLINE);

	// Polling
	EXPORT_CONSTANT(exports, NN_POLLIN);
	EXPORT_CONSTANT(exports, NN_POLLOUT);
}

NODE_MODULE(node_nanomsg, InitAll)
