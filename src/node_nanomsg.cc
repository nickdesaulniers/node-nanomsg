#include <stdio.h>
#include <stdlib.h>
#include "node_pointer.h"

#include <nn.h>
#include <pubsub.h>
#include <pipeline.h>
#include <bus.h>
#include <pair.h>
#include <reqrep.h>
#include <survey.h>
#include <inproc.h>
#include <ipc.h>
#include <tcp.h>

using v8::Array;
using v8::Function;
using v8::FunctionTemplate;
using v8::Handle;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

NAN_METHOD(Socket) {
  NanScope();

  int domain = args[0]->Int32Value();
  int protocol = args[1]->Int32Value();

  NanReturnValue(NanNew<Number>(nn_socket(domain, protocol)));
}

NAN_METHOD(Close) {
  NanScope();

  int s = args[0]->Int32Value();

  NanReturnValue(NanNew<Number>(nn_close(s)));
}

NAN_METHOD(Setopt) {
  NanScope();

  int s = args[0]->Int32Value();
  int level = args[1]->Int32Value();
  int option = args[2]->Int32Value();
  int optval = args[3]->Int32Value();

  NanReturnValue(
      NanNew<Number>(nn_setsockopt(s, level, option, &optval, sizeof(optval))));
}

NAN_METHOD(Getopt) {
  NanScope();

  int s = args[0]->Int32Value();
  int level = args[1]->Int32Value();
  int option = args[2]->Int32Value();
  int optval;
  size_t optsize = sizeof(optval);

  // check if the function succeeds
  if (nn_getsockopt(s, level, option, &optval, &optsize) == 0) {
    NanReturnValue(NanNew<Number>(optval));
  } else {
    // pass the error back as an undefined return
    NanReturnUndefined();
  }
}

NAN_METHOD(Chan) {
  NanScope();

  int s = args[0]->Int32Value();
  int level = NN_SUB;
  int option = args[1]->Int32Value();
  v8::String::Utf8Value str(args[2]);

  NanReturnValue(
      NanNew<Number>(nn_setsockopt(s, level, option, *str, str.length())));
}

NAN_METHOD(Bind) {
  NanScope();

  int s = args[0]->Int32Value();
  String::Utf8Value addr(args[1]);

  NanReturnValue(NanNew<Number>(nn_bind(s, *addr)));
}

NAN_METHOD(Connect) {
  NanScope();

  int s = args[0]->Int32Value();
  String::Utf8Value addr(args[1]);

  NanReturnValue(NanNew<Number>(nn_connect(s, *addr)));
}

NAN_METHOD(Shutdown) {
  NanScope();

  int s = args[0]->Int32Value();
  int how = args[1]->Int32Value();

  NanReturnValue(NanNew<Number>(nn_shutdown(s, how)));
}

NAN_METHOD(Send) {
  NanScope();

  int s = args[0]->Int32Value();
  int flags = args[2]->Int32Value();

  if (node::Buffer::HasInstance(args[1])) {
    NanReturnValue(NanNew<Number>(nn_send(
        s, node::Buffer::Data(args[1]), node::Buffer::Length(args[1]), flags)));
  } else {
    v8::String::Utf8Value str(args[1]->ToString());
    NanReturnValue(NanNew<Number>(nn_send(s, *str, str.length(), flags)));
  }
}

NAN_METHOD(Recv) {
  NanScope();

  int s = args[0]->Int32Value();
  int flags = args[1]->Int32Value();

  // Invoke nanomsg function.
  char *buf = NULL;
  int len = nn_recv(s, &buf, NN_MSG, flags);

  if (len > -1) {

    v8::Local<v8::Value> h = NanNewBufferHandle(len);
    memcpy(node::Buffer::Data(h), buf, len);

    // dont memory leak
    nn_freemsg(buf);

    NanReturnValue(h);

  } else {

    NanReturnValue(NanNew<Number>(len));
  }
}

NAN_METHOD(SymbolInfo) {
  NanScope();

  int s = args[0]->Int32Value();
  struct nn_symbol_properties prop;
  int ret = nn_symbol_info(s, &prop, sizeof(prop));

  if (ret > 0) {
    Local<Object> obj = NanNew<Object>();
    obj->Set(NanNew("value"), NanNew<Number>(prop.value));
    obj->Set(NanNew("ns"), NanNew<Number>(prop.ns));
    obj->Set(NanNew("type"), NanNew<Number>(prop.type));
    obj->Set(NanNew("unit"), NanNew<Number>(prop.unit));
    obj->Set(NanNew("name"), NanNew<String>(prop.name));
    NanReturnValue(obj);
  } else if (ret == 0) {
    // symbol index out of range
    NanReturnUndefined();
  } else {
    NanThrowError(nn_strerror(nn_errno()));
    NanReturnUndefined();
  }
}

NAN_METHOD(Symbol) {
  NanScope();

  int s = args[0]->Int32Value();
  int val;
  const char *ret = nn_symbol(s, &val);

  if (ret) {
    Local<Object> obj = NanNew<Object>();
    obj->Set(NanNew("value"), NanNew<Number>(val));
    obj->Set(NanNew("name"), NanNew<String>(ret));
    NanReturnValue(obj);
  } else {
    // symbol index out of range
    // this behaviour seems inconsistent with SymbolInfo() above
    // but we are faithfully following the libnanomsg API, warta and all
    NanThrowError(nn_strerror(nn_errno())); // EINVAL
    NanReturnUndefined();
  }
}

NAN_METHOD(Term) {
  NanScope();
  nn_term();
  NanReturnUndefined();
}

// Pass in two sockets, or (socket, -1) or (-1, socket) for loopback
NAN_METHOD(Device) {
  NanScope();
  int s1 = args[0]->Int32Value();
  int s2 = args[1]->Int32Value();

  // nn_device only returns when it encounters an error
  nn_device(s1, s2);
  NanThrowError(nn_strerror(nn_errno()));
  NanReturnUndefined();
}

NAN_METHOD(Errno) {
  NanScope();
  NanReturnValue(NanNew<Number>(nn_errno()));
}

NAN_METHOD(Err) {
  NanScope();
  NanReturnValue(NanNew<String>(nn_strerror(nn_errno())));
}

typedef struct nanomsg_socket_s {
  uv_poll_t poll_handle;
  uv_os_sock_t sockfd;
  NanCallback *callback;
} nanomsg_socket_t;

void NanomsgReadable(uv_poll_t *req, int status, int events) {
  NanScope();
  nanomsg_socket_t *context;
  context = reinterpret_cast<nanomsg_socket_t *>(req);

  if (events & UV_READABLE) {
    Local<Value> argv[] = { NanNew<Number>(events) };
    context->callback->Call(1, argv);
  }
}

NAN_METHOD(PollSendSocket) {
  NanScope();

  int s = args[0]->Int32Value();
  NanCallback *callback = new NanCallback(args[1].As<Function>());

  nanomsg_socket_t *context;
  size_t siz = sizeof(uv_os_sock_t);

  context = reinterpret_cast<nanomsg_socket_t *>(calloc(1, sizeof *context));
  context->poll_handle.data = context;
  context->callback = callback;
  nn_getsockopt(s, NN_SOL_SOCKET, NN_SNDFD, &context->sockfd, &siz);

  if (context->sockfd != 0) {
    uv_poll_init_socket(uv_default_loop(), &context->poll_handle,
                        context->sockfd);
    uv_poll_start(&context->poll_handle, UV_READABLE, NanomsgReadable);
    NanReturnValue(WrapPointer(context, 8));
  } else {
    NanReturnUndefined();
  }
}

NAN_METHOD(PollReceiveSocket) {
  NanScope();

  int s = args[0]->Int32Value();
  NanCallback *callback = new NanCallback(args[1].As<Function>());

  nanomsg_socket_t *context;
  size_t siz = sizeof(uv_os_sock_t);

  context = reinterpret_cast<nanomsg_socket_t *>(calloc(1, sizeof *context));
  context->poll_handle.data = context;
  context->callback = callback;
  nn_getsockopt(s, NN_SOL_SOCKET, NN_RCVFD, &context->sockfd, &siz);

  if (context->sockfd != 0) {
    uv_poll_init_socket(uv_default_loop(), &context->poll_handle,
                        context->sockfd);
    uv_poll_start(&context->poll_handle, UV_READABLE, NanomsgReadable);
    NanReturnValue(WrapPointer(context, 8));
  } else {
    NanReturnUndefined();
  }
}

NAN_METHOD(PollStop) {
  NanScope();

  nanomsg_socket_t *context = UnwrapPointer<nanomsg_socket_t *>(args[0]);
  int r = uv_poll_stop(&context->poll_handle);
  NanReturnValue(NanNew<Number>(r));
}

class NanomsgDeviceWorker : public NanAsyncWorker {
public:
  NanomsgDeviceWorker(NanCallback *callback, int s1, int s2)
      : NanAsyncWorker(callback), s1(s1), s2(s2) {}
  ~NanomsgDeviceWorker() {}

  // Executed inside the worker-thread.
  // It is not safe to access V8, or V8 data structures
  // here, so everything we need for input and output
  // should go on `this`.
  void Execute() {
    // nn_errno() only returns on error
    nn_device(s1, s2);
    err = nn_errno();
  }

  // Executed when the async work is complete
  // this function will be run inside the main event loop
  // so it is safe to use V8 again
  void HandleOKCallback() {
    NanScope();

    Local<Value> argv[] = { NanNew<Number>(err) };

    callback->Call(1, argv);
  };

private:
  int s1;
  int s2;
  int err;
};

// Asynchronous access to the `nn_device()` function
NAN_METHOD(DeviceWorker) {
  NanScope();

  int s1 = args[0]->Int32Value();
  int s2 = args[1]->Int32Value();
  NanCallback *callback = new NanCallback(args[2].As<Function>());

  NanAsyncQueueWorker(new NanomsgDeviceWorker(callback, s1, s2));
  NanReturnUndefined();
}

#define EXPORT_METHOD(C, S)                                                    \
  C->Set(NanNew(#S), NanNew<FunctionTemplate>(S)->GetFunction());

void InitAll(Handle<Object> exports) {
  NanScope();

  // Export functions.
  EXPORT_METHOD(exports, Socket);
  EXPORT_METHOD(exports, Close);
  EXPORT_METHOD(exports, Chan);
  EXPORT_METHOD(exports, Bind);
  EXPORT_METHOD(exports, Connect);
  EXPORT_METHOD(exports, Shutdown);
  EXPORT_METHOD(exports, Send);
  EXPORT_METHOD(exports, Recv);
  EXPORT_METHOD(exports, Errno);
  EXPORT_METHOD(exports, PollSendSocket);
  EXPORT_METHOD(exports, PollReceiveSocket);
  EXPORT_METHOD(exports, PollStop);
  EXPORT_METHOD(exports, DeviceWorker);
  EXPORT_METHOD(exports, SymbolInfo);
  EXPORT_METHOD(exports, Symbol);
  EXPORT_METHOD(exports, Term);

  EXPORT_METHOD(exports, Getopt);
  EXPORT_METHOD(exports, Setopt);
  EXPORT_METHOD(exports, Err);

  // Export symbols.
  for (int i = 0;; ++i) {
    int value;
    const char *symbol_name = nn_symbol(i, &value);
    if (symbol_name == NULL) {
      break;
    }
    exports->Set(NanNew(symbol_name), NanNew<Number>(value));
  }
}

NODE_MODULE(node_nanomsg, InitAll)
