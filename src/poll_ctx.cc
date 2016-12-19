#include "nn.h"
#include "poll_ctx.h"

using v8::Function;
using v8::Local;
using v8::Number;
using v8::Value;

static void NanomsgReadable(uv_poll_t* req, int /* status */, int events) {
  const PollCtx* const context = static_cast<PollCtx*>(req->data);
  if (events & UV_READABLE) {
    context->invoke_callback(events);
  }
}

void PollCtx::begin_poll (const int s, const bool is_sender) {
  size_t siz = sizeof(uv_os_sock_t);
  nn_getsockopt(s, NN_SOL_SOCKET, is_sender ? NN_SNDFD : NN_RCVFD, &sockfd,
      &siz);
  if (sockfd != 0) {
    uv_poll_init_socket(uv_default_loop(), &poll_handle, sockfd);
    uv_poll_start(&poll_handle, UV_READABLE, NanomsgReadable);
  }
}

PollCtx::PollCtx (const int s, const bool is_sender,
    const Local<Function> cb): callback(cb) {
  // TODO: maybe container_of can be used instead?
  // that would save us this assignment, and ugly static_cast hacks.
  poll_handle.data = this;
  begin_poll(s, is_sender);
}

void PollCtx::invoke_callback (const int events) const {
  Nan::HandleScope scope;
  Local<Value> argv[] = { Nan::New<Number>(events) };
  callback.Call(1, argv);
}
