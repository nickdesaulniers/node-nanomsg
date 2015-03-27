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

#define ret NanReturnValue
#define utf8 v8::String::Utf8Value
#define integer As<Number>()->IntegerValue()
#define S args[0].integer

NAN_METHOD(Socket) {
  NanScope();

  int domain = args[0]->Uint32Value();
  int protocol = args[1]->Uint32Value();

  // Invoke nanomsg function.
  int ret = nn_socket(domain, protocol);

  NanReturnValue(NanNew<Number>(ret));
}

NAN_METHOD(Close) {
  NanScope();

  int s = args[0]->Uint32Value();

  // Invoke nanomsg function.
  int ret = nn_close(s);

  NanReturnValue(NanNew<Number>(ret));
}

NAN_METHOD(Setopt) {
  NanScope();

  int level = args[1].integer;
  int option = args[2].integer;
  int optval = args[3].integer;

  ret(NanNew<Number>(nn_setsockopt(S, level, option, &optval, sizeof(optval))));
}

NAN_METHOD(Getopt) {
  NanScope();

  int optval[1];
  int option = args[2].integer;
  size_t optsize = sizeof(optval);

  // check if the function succeeds
  if (nn_getsockopt(S, args[1].integer, option, optval, &optsize) == 0) {
    ret(NanNew<Number>(optval[0]));
  } else {
    // pass the error back as an undefined return
    NanReturnUndefined();
  }
}

NAN_METHOD(Chan) {
  NanScope();

  int level = NN_SUB;
  int option = args[1].integer;

  utf8 str(args[2]);

  ret(NanNew<Number>(nn_setsockopt(S, level, option, *str, str.length())));
}

NAN_METHOD(Bind) {
  NanScope();

  int s = args[0]->Uint32Value();
  String::Utf8Value addr(args[1]);

  // Invoke nanomsg function.
  int ret = nn_bind(s, *addr);

  NanReturnValue(NanNew<Number>(ret));
}

NAN_METHOD(Connect) {
  NanScope();

  int s = args[0]->Uint32Value();
  String::Utf8Value addr(args[1]);

  // Invoke nanomsg function.
  int ret = nn_connect(s, *addr);

  NanReturnValue(NanNew<Number>(ret));
}

NAN_METHOD(Shutdown) {
  NanScope();

  int s = args[0]->Uint32Value();
  int how = args[1]->Uint32Value();

  // Invoke nanomsg function.
  int ret = nn_shutdown(s, how);

  NanReturnValue(NanNew<Number>(ret));
}

NAN_METHOD(Send) {
  NanScope();

  int flags = args[2].integer;
  std::string *input;

  if (node::Buffer::HasInstance(args[1]->ToObject())) {

    v8::Handle<v8::Object> object = args[1]->ToObject();

    const char *data = node::Buffer::Data(object);
    input = new std::string(data, node::Buffer::Length(object));

  } else {

    utf8 str(args[1]->ToString());

    input = new std::string(*str);
  }

  v8::Local<v8::Number> bytes;

  bytes = NanNew<Number>(nn_send(S, input->c_str(), input->length(), flags));

  delete input;

  ret(bytes);
}

NAN_METHOD(Recv) {
  NanScope();

  int s = args[0]->Uint32Value();
  int flags = args[1]->Uint32Value();

  // Invoke nanomsg function.
  char *buf = NULL;
  int len = nn_recv(s, &buf, NN_MSG, flags);

  if (len > -1) {

    v8::Local<v8::Value> h = NanNewBufferHandle(len);
    memcpy(node::Buffer::Data(h), buf, len);

    // dont memory leak
    nn_freemsg(buf);

    ret(h);

  } else {

    ret(NanNew<Number>(len));
  }
}

NAN_METHOD(SymbolInfo) {
  NanScope();

  int s = args[0]->Uint32Value();
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

  int s = args[0]->Uint32Value();
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
  int s1 = args[0]->Uint32Value();
  int s2 = args[1]->Uint32Value();

  // nn_device only returns when it encounters an error
  nn_device(s1, s2);
  NanThrowError(nn_strerror(nn_errno()));
  NanReturnUndefined();
}

NAN_METHOD(Errno) {
  NanScope();

  // Invoke nanomsg function.
  int ret = nn_errno();

  NanReturnValue(NanNew<Number>(ret));
}

NAN_METHOD(Err) {
  NanScope();
  ret(NanNew<String>(nn_strerror(nn_errno())));
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

  int s = args[0]->Uint32Value();
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

  int s = args[0]->Uint32Value();
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

  int s1 = args[0]->Uint32Value();
  int s2 = args[1]->Uint32Value();
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
