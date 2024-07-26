#ifndef SYSTEM_NANOMSG
#include "nn.h"
#else
#include "nanomsg/nn.h"
#endif
#include "poll_ctx.h"

void PollCtx::on_readable(uv_poll_t* req, int /* status */, int events) {
  if (!(events & UV_READABLE))
    return;
  Nan::HandleScope scope;
  v8::Local<v8::Value> argv[] = { Nan::New<v8::Number>(events) };
  PollCtx* ctx = reinterpret_cast<PollCtx*>(req->data);
  ctx->callback->Call(1, argv, ctx->async_resource);
}

PollCtx::PollCtx (const int s, const bool is_sender,
    Nan::Callback* cb): Nan::AsyncWorker(cb, "nanomsg::PollCtx") {
  size_t siz = sizeof(uv_os_sock_t);
  uv_os_sock_t sockfd;
  nn_getsockopt(s, NN_SOL_SOCKET, is_sender ? NN_SNDFD : NN_RCVFD, &sockfd,
      &siz);
  if (!sockfd)
    return;

  poll_handle.data = this;
  uv_poll_init_socket(uv_default_loop(), &poll_handle, sockfd);
  uv_poll_start(&poll_handle, UV_READABLE, PollCtx::on_readable);
}

// Nan will invoke this once it's done with the Buffer, in case we wanted to
// free ptr.  In this case, ptr is a PollCtx that we're not done with and don't
// want to free yet (not until PollStop is invoked), so we do nothing.
static void wrap_pointer_cb(char * /* data */, void * /* hint */) {}

v8::Local<v8::Value> PollCtx::WrapPointer (void* ptr, size_t length) {
   return Nan::NewBuffer(static_cast<char *>(ptr), length, wrap_pointer_cb, 0)
     .ToLocalChecked();
}

PollCtx* PollCtx::UnwrapPointer (v8::Local<v8::Value> buffer) {
   v8::Local<v8::ArrayBufferView> ui = buffer.As<v8::ArrayBufferView>();
   v8::Local<v8::ArrayBuffer> abuf = ui->Buffer();
   void *data = NULL;
#if (V8_MAJOR_VERSION >= 8)
   data = static_cast<char*>(abuf->GetBackingStore()->Data());
   abuf->Detach();
#else
   data = static_cast<char*>(abuf->GetContents().Data());
#endif
   return reinterpret_cast<PollCtx*>(node::Buffer::HasInstance(buffer) ? data : NULL);
}
