// Source: @tootallnate https://gist.github.com/TooTallNate/3987725
// Maintain an up-to-date copy of this file when necessary.

#pragma once

#include <nan.h>
#include "poll_ctx.h"

/*
 * Called when the "pointer" is garbage collected.
 */

static void wrap_pointer_cb(char *data, void *hint) {}

/*
 * Wraps "ptr" into a new SlowBuffer instance with size "length".
 */

static v8::Local<v8::Value> WrapPointer(void *ptr, size_t length) {
  return Nan::NewBuffer(static_cast<char *>(ptr), length, wrap_pointer_cb, 0)
      .ToLocalChecked();
}

/*
 * Unwraps Buffer instance "buffer" to a PollCtx with the offset specified.
 */

PollCtx* UnwrapPointer(v8::Local<v8::Value> buffer,
    const int64_t offset = 0) {
  return reinterpret_cast<PollCtx*>(node::Buffer::HasInstance(buffer) ?
      node::Buffer::Data(buffer.As<v8::Object>()) + offset : 0);
}
