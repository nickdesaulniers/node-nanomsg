#pragma once

#include <nan.h>

class PollCtx : public Nan::AsyncWorker {
  static void on_readable(uv_poll_t* req, int /* status */, int events);
public:
  uv_poll_t poll_handle; // for libuv
  PollCtx (const int s, const bool is_sender, Nan::Callback* cb);
  void Execute () /* override */ {};
  static v8::Local<v8::Value> WrapPointer (void* ptr, size_t length);
  static PollCtx* UnwrapPointer (v8::Local<v8::Value> buffer);
};
