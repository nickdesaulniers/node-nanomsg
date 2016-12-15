#include <stdio.h>
#include <stdlib.h>
#include "node_pointer.h"

#include <nn.h>

#include <inproc.h>
#include <ipc.h>
#include <tcp.h>
#include <ws.h>

#include <pubsub.h>
#include <pipeline.h>
#include <bus.h>
#include <pair.h>
#include <reqrep.h>
#include <survey.h>

using v8::Array;
using v8::Function;
using v8::FunctionTemplate;
using v8::Local;
using v8::Number;
using v8::Object;
using v8::String;
using v8::Value;

NAN_METHOD(Socket) {
  int domain = Nan::To<int>(info[0]).FromJust();
  int protocol = Nan::To<int>(info[1]).FromJust();

  info.GetReturnValue().Set(Nan::New<Number>(nn_socket(domain, protocol)));
}

NAN_METHOD(Close) {
  int s = Nan::To<int>(info[0]).FromJust();
  int rc = 0;

  do {
    rc = nn_close(s);
  } while (rc < 0 && errno == EINTR);

  info.GetReturnValue().Set(Nan::New<Number>(rc));
}

NAN_METHOD(Setopt) {
  int s = Nan::To<int>(info[0]).FromJust();
  int level = Nan::To<int>(info[1]).FromJust();
  int option = Nan::To<int>(info[2]).FromJust();
  int optval = Nan::To<int>(info[3]).FromJust();

  info.GetReturnValue().Set(Nan::New<Number>(
      nn_setsockopt(s, level, option, &optval, sizeof(optval))));
}

NAN_METHOD(Getopt) {
  int s = Nan::To<int>(info[0]).FromJust();
  int level = Nan::To<int>(info[1]).FromJust();
  int option = Nan::To<int>(info[2]).FromJust();
  int optval;
  size_t optsize = sizeof(optval);

  // check if the function succeeds
  if (nn_getsockopt(s, level, option, &optval, &optsize) == 0) {
    info.GetReturnValue().Set(Nan::New<Number>(optval));
  }
}

NAN_METHOD(Chan) {
  int s = Nan::To<int>(info[0]).FromJust();
  int level = NN_SUB;
  int option = Nan::To<int>(info[1]).FromJust();
  v8::String::Utf8Value str(info[2]);

  info.GetReturnValue().Set(
      Nan::New<Number>(nn_setsockopt(s, level, option, *str, str.length())));
}

NAN_METHOD(Bind) {
  int s = Nan::To<int>(info[0]).FromJust();
  String::Utf8Value addr(info[1]);

  info.GetReturnValue().Set(Nan::New<Number>(nn_bind(s, *addr)));
}

NAN_METHOD(Connect) {
  int s = Nan::To<int>(info[0]).FromJust();
  String::Utf8Value addr(info[1]);

  info.GetReturnValue().Set(Nan::New<Number>(nn_connect(s, *addr)));
}

NAN_METHOD(Shutdown) {
  int s = Nan::To<int>(info[0]).FromJust();
  int how = Nan::To<int>(info[1]).FromJust();

  info.GetReturnValue().Set(Nan::New<Number>(nn_shutdown(s, how)));
}

NAN_METHOD(Send) {
  int s = Nan::To<int>(info[0]).FromJust();
  int flags = Nan::To<int>(info[2]).FromJust();

  if (node::Buffer::HasInstance(info[1])) {
    info.GetReturnValue().Set(Nan::New<Number>(nn_send(
        s, node::Buffer::Data(info[1]), node::Buffer::Length(info[1]), flags)));
  } else {
    v8::String::Utf8Value str(info[1]);
    info.GetReturnValue().Set(
        Nan::New<Number>(nn_send(s, *str, str.length(), flags)));
  }
}

void fcb(char *data, void *hint) {
  nn_freemsg(data);
  (void)hint;
}

NAN_METHOD(Recv) {
  int s = Nan::To<int>(info[0]).FromJust();
  int flags = Nan::To<int>(info[1]).FromJust();

  // Invoke nanomsg function.
  char *buf = NULL;
  int len = nn_recv(s, &buf, NN_MSG, flags);

  if (len > -1) {
    v8::Local<v8::Object> h = Nan::NewBuffer(buf, len, fcb, 0).ToLocalChecked();
    info.GetReturnValue().Set(h);
  } else {
    info.GetReturnValue().Set(Nan::New<Number>(len));
  }
}

NAN_METHOD(SymbolInfo) {
  int s = Nan::To<int>(info[0]).FromJust();
  struct nn_symbol_properties prop;
  int ret = nn_symbol_info(s, &prop, sizeof(prop));

  if (ret > 0) {
    Local<Object> obj = Nan::New<Object>();
    Nan::Set(obj, Nan::New("value").ToLocalChecked(),
             Nan::New<Number>(prop.value));
    Nan::Set(obj, Nan::New("ns").ToLocalChecked(), Nan::New<Number>(prop.ns));
    Nan::Set(obj, Nan::New("type").ToLocalChecked(),
             Nan::New<Number>(prop.type));
    Nan::Set(obj, Nan::New("unit").ToLocalChecked(),
             Nan::New<Number>(prop.unit));
    Nan::Set(obj, Nan::New("name").ToLocalChecked(),
             Nan::New<String>(prop.name).ToLocalChecked());
    info.GetReturnValue().Set(obj);
  } else if (ret != 0) {
    Nan::ThrowError(nn_strerror(nn_errno()));
  }
}

NAN_METHOD(Symbol) {
  int s = Nan::To<int>(info[0]).FromJust();
  int val;
  const char *ret = nn_symbol(s, &val);

  if (ret) {
    Local<Object> obj = Nan::New<Object>();
    Nan::Set(obj, Nan::New("value").ToLocalChecked(), Nan::New<Number>(val));
    Nan::Set(obj, Nan::New("name").ToLocalChecked(),
             Nan::New<String>(ret).ToLocalChecked());
    info.GetReturnValue().Set(obj);
  } else {
    // symbol index out of range
    // this behaviour seems inconsistent with SymbolInfo() above
    // but we are faithfully following the libnanomsg API, warta and all
    Nan::ThrowError(nn_strerror(nn_errno())); // EINVAL
  }
}

NAN_METHOD(Term) { nn_term(); }

// Pass in two sockets, or (socket, -1) or (-1, socket) for loopback
NAN_METHOD(Device) {
  int s1 = Nan::To<int>(info[0]).FromJust();
  int s2 = Nan::To<int>(info[1]).FromJust();

  // nn_device only returns when it encounters an error
  nn_device(s1, s2);
  Nan::ThrowError(nn_strerror(nn_errno()));
}

NAN_METHOD(Errno) { info.GetReturnValue().Set(Nan::New<Number>(nn_errno())); }

NAN_METHOD(Err) {
  info.GetReturnValue().Set(Nan::New(nn_strerror(nn_errno())).ToLocalChecked());
}

void NanomsgReadable(uv_poll_t *req, int status, int events) {
  Nan::HandleScope scope;

  nanomsg_socket_s *context;
  context = reinterpret_cast<nanomsg_socket_s *>(req);

  if (events & UV_READABLE) {
    Local<Value> argv[] = { Nan::New<Number>(events) };
    context->callback->Call(1, argv);
  }
}

// release memory of given context object when this function is called twice
// with the same context argument
static void free_context(nanomsg_socket_s *context) {
  uv_mutex_lock(&context->free_mutex);
  if (context->free_called) {
    delete (context->callback);
    context->callback = NULL;

    // forget poll_handle.data because it indicate to the context itself.
    // otherwise free operation will try to release the memory of the context
    // twice.
    context->poll_handle.data = NULL;

    uv_mutex_destroy(&context->close_mutex);

    uv_mutex_unlock(&context->free_mutex);
    uv_mutex_destroy(&context->free_mutex);
    free(context);
  } else {
    context->free_called = true;
    uv_mutex_unlock(&context->free_mutex);
  }
}

/*
 * Called when the "pointer" is garbage collected.
 */

// this function is called asynchronously at destructor when garbage collection
// is executed
static void wrap_pointer_cb(char *data, void *hint) {
  nanomsg_socket_s *context = reinterpret_cast<nanomsg_socket_s *>(data);

  // free context object if close_cb of uv_close has been called already
  free_context(context);
}

/*
 * Wraps "ptr" into a new SlowBuffer instance with size "length".
 */

static v8::Local<v8::Value> WrapPointer(void *ptr, size_t length) {
  return Nan::NewBuffer(static_cast<char *>(ptr), length, wrap_pointer_cb, 0)
      .ToLocalChecked();
}

NAN_METHOD(PollSendSocket) {
  int s = Nan::To<int>(info[0]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[1].As<Function>());

  nanomsg_socket_s *context;
  size_t siz = sizeof(uv_os_sock_t);

  context = reinterpret_cast<nanomsg_socket_s *>(calloc(1, sizeof *context));
  context->poll_handle.data = context;
  context->callback = callback;

  uv_mutex_init(&context->close_mutex);
  context->close_called = false;

  uv_mutex_init(&context->free_mutex);
  context->free_called = false;

  nn_getsockopt(s, NN_SOL_SOCKET, NN_SNDFD, &context->sockfd, &siz);

  if (context->sockfd != 0) {
    uv_poll_init_socket(uv_default_loop(), &context->poll_handle,
                        context->sockfd);
    uv_poll_start(&context->poll_handle, UV_READABLE, NanomsgReadable);
    info.GetReturnValue().Set(WrapPointer(context, 8));
  }
}

NAN_METHOD(PollReceiveSocket) {
  int s = Nan::To<int>(info[0]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[1].As<Function>());

  nanomsg_socket_s *context;
  size_t siz = sizeof(uv_os_sock_t);

  context = reinterpret_cast<nanomsg_socket_s *>(calloc(1, sizeof *context));
  context->poll_handle.data = context;
  context->callback = callback;

  uv_mutex_init(&context->close_mutex);
  context->close_called = false;

  uv_mutex_init(&context->free_mutex);
  context->free_called = false;

  nn_getsockopt(s, NN_SOL_SOCKET, NN_RCVFD, &context->sockfd, &siz);

  if (context->sockfd != 0) {
    uv_poll_init_socket(uv_default_loop(), &context->poll_handle,
                        context->sockfd);
    uv_poll_start(&context->poll_handle, UV_READABLE, NanomsgReadable);
    info.GetReturnValue().Set(WrapPointer(context, 8));
  }
}

/*
 * Unwraps Buffer instance "buffer" to a C `char *` (no offset applied).
 */

static char *UnwrapPointer(v8::Local<v8::Value> buffer) {
  if (node::Buffer::HasInstance(buffer)) {
    return node::Buffer::Data(buffer.As<v8::Object>());
  } else {
    return 0;
  }
}

/**
 * Templated version of UnwrapPointer that does a reinterpret_cast() on the
 * pointer before returning it.
 */

template <typename Type>
static Type UnwrapPointer(v8::Local<v8::Value> buffer) {
  return reinterpret_cast<Type>(UnwrapPointer(buffer));
}

// this function is called asynchronously after uv_close function call
void close_cb(uv_handle_t *handle) {
  nanomsg_socket_s *context =
      reinterpret_cast<nanomsg_socket_s *>(handle->data);

  // free context object if it's destructor has been called already
  free_context(context);
}

NAN_METHOD(PollStop) {
  nanomsg_socket_s *context = UnwrapPointer<nanomsg_socket_s *>(info[0]);

  // the mutex guard is necessary for the case when asynchronous flush ends and
  // synchronous close are called at the same time.
  uv_mutex_lock(&context->close_mutex);
  if (context->close_called != true) {
    context->close_called = true;
    uv_close((uv_handle_t *)&context->poll_handle, &close_cb);
  }
  info.GetReturnValue().Set(Nan::New<Number>(0));
  uv_mutex_unlock(&context->close_mutex);
}

class NanomsgDeviceWorker : public Nan::AsyncWorker {
public:
  NanomsgDeviceWorker(Nan::Callback *callback, int s1, int s2)
      : Nan::AsyncWorker(callback), s1(s1), s2(s2) {}
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
    Nan::HandleScope scope;

    Local<Value> argv[] = { Nan::New<Number>(err) };

    callback->Call(1, argv);
  };

private:
  int s1;
  int s2;
  int err;
};

// Asynchronous access to the `nn_device()` function
NAN_METHOD(DeviceWorker) {
  int s1 = Nan::To<int>(info[0]).FromJust();
  int s2 = Nan::To<int>(info[1]).FromJust();
  Nan::Callback *callback = new Nan::Callback(info[2].As<Function>());

  Nan::AsyncQueueWorker(new NanomsgDeviceWorker(callback, s1, s2));
}

#define EXPORT_METHOD(C, S)                                                    \
  Nan::Set(C, Nan::New(#S).ToLocalChecked(),                                   \
           Nan::GetFunction(Nan::New<FunctionTemplate>(S)).ToLocalChecked());

NAN_MODULE_INIT(InitAll) {
  Nan::HandleScope scope;

  // Export functions.
  EXPORT_METHOD(target, Socket);
  EXPORT_METHOD(target, Close);
  EXPORT_METHOD(target, Chan);
  EXPORT_METHOD(target, Bind);
  EXPORT_METHOD(target, Connect);
  EXPORT_METHOD(target, Shutdown);
  EXPORT_METHOD(target, Send);
  EXPORT_METHOD(target, Recv);
  EXPORT_METHOD(target, Errno);
  EXPORT_METHOD(target, PollSendSocket);
  EXPORT_METHOD(target, PollReceiveSocket);
  EXPORT_METHOD(target, PollStop);
  EXPORT_METHOD(target, DeviceWorker);
  EXPORT_METHOD(target, SymbolInfo);
  EXPORT_METHOD(target, Symbol);
  EXPORT_METHOD(target, Term);

  EXPORT_METHOD(target, Getopt);
  EXPORT_METHOD(target, Setopt);
  EXPORT_METHOD(target, Err);

  // Export symbols.
  for (int i = 0;; ++i) {
    int value;
    const char *symbol_name = nn_symbol(i, &value);
    if (symbol_name == NULL) {
      break;
    }
    Nan::Set(target, Nan::New(symbol_name).ToLocalChecked(),
             Nan::New<Number>(value));
  }
}

NODE_MODULE(node_nanomsg, InitAll)
