#include "nn.h"
#include "poll_ctx.h"

using v8::Function;
using v8::Local;
using v8::Number;
using v8::Value;

void PollCtx::on_readable(uv_poll_t* req, int /* status */, int events) {
  if (!(events & UV_READABLE))
    return;
  Nan::HandleScope scope;
  Local<Value> argv[] = { Nan::New<Number>(events) };
  reinterpret_cast<PollCtx*>(req->data)->callback.Call(1, argv);
}

void PollCtx::begin_poll (const int s, const bool is_sender) {
  size_t siz = sizeof(uv_os_sock_t);
  nn_getsockopt(s, NN_SOL_SOCKET, is_sender ? NN_SNDFD : NN_RCVFD, &sockfd,
      &siz);
  if (sockfd != 0) {
    uv_poll_init_socket(uv_default_loop(), &poll_handle, sockfd);
    uv_poll_start(&poll_handle, UV_READABLE, PollCtx::on_readable);
  }
}

PollCtx::PollCtx (const int s, const bool is_sender,
    const Local<Function> cb): callback(cb) {
  // TODO: maybe container_of can be used instead?
  // that would save us this assignment, and ugly static_cast hacks.
  poll_handle.data = this;
  begin_poll(s, is_sender);
}

// Nan will invoke this once it's done with the Buffer, in case we wanted to
// free ptr.  In this case, ptr is a PollCtx that we're not done with and don't
// want to free yet (not until PollStop is invoked), so we do nothing.
static void wrap_pointer_cb(char * /* data */, void * /* hint */) {}

Local<Value> PollCtx::WrapPointer (void* ptr, size_t length) {
   return Nan::NewBuffer(static_cast<char *>(ptr), length, wrap_pointer_cb, 0)
     .ToLocalChecked();
}

PollCtx* PollCtx::UnwrapPointer (v8::Local<v8::Value> buffer) {
  return reinterpret_cast<PollCtx*>(node::Buffer::HasInstance(buffer) ?
    node::Buffer::Data(buffer.As<v8::Object>()) : NULL);
}
