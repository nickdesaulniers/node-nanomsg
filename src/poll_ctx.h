#pragma once

#include <nan.h>

class PollCtx {
  const Nan::Callback callback_;
  static void on_readable(uv_poll_t* req, int /* status */, int events);
public:
  uv_poll_t poll_handle; // for libuv
  PollCtx (const int s, const bool is_sender,
      const v8::Local<v8::Function> cb);
  static v8::Local<v8::Value> WrapPointer (void* ptr, size_t length);
  static PollCtx* UnwrapPointer (v8::Local<v8::Value> buffer);
};
