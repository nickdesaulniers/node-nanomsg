#include "nn.h"
#include "poll_ctx.h"

static void NanomsgReadable(uv_poll_t* req, int /* status */, int events) {
  const PollCtx* const context = static_cast<PollCtx*>(req->data);
  context->invoke_callback(events);
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
    const v8::Local<v8::Function> cb): callback(cb) {
  // TODO: maybe container_of can be used instead?
  // that would save us this assignment, and ugly static_cast hacks.
  poll_handle.data = this;
  begin_poll(s, is_sender);
}

void PollCtx::invoke_callback (const int events) const {
  Nan::HandleScope scope;
  if (events & UV_READABLE) {
    v8::Local<v8::Value> argv[] = { Nan::New<v8::Number>(events) };
    callback.Call(1, argv);
  }
}
