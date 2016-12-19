// Source: @tootallnate https://gist.github.com/TooTallNate/3987725
// Maintain an up-to-date copy of this file when necessary.

#pragma once

#include <nan.h>

/*
 * Called when the "pointer" is garbage collected.
 */

// UNUSED: however, inline functions don't generate code.
inline static void wrap_pointer_cb(char *data, void *hint) {
  // fprintf(stderr, "wrap_pointer_cb\n");
}

/*
 * Wraps "ptr" into a new SlowBuffer instance with size "length".
 */

static v8::Local<v8::Value> WrapPointer(void *ptr, size_t length) {
  return Nan::NewBuffer(static_cast<char *>(ptr), length, wrap_pointer_cb, 0)
      .ToLocalChecked();
}

/*
 * Unwraps Buffer instance "buffer" to a C `char *` with the offset specified.
 */

static char* UnwrapPointer(v8::Local<v8::Value> buffer,
    const int64_t offset = 0) {
  if (node::Buffer::HasInstance(buffer)) {
    return node::Buffer::Data(buffer.As<v8::Object>()) + offset;
  } else {
    return 0;
  }
}

/**
 * Templated version of UnwrapPointer that does a reinterpret_cast() on the
 * pointer before returning it.
 */

template <typename Type>
inline static Type UnwrapPointer(v8::Local<v8::Value> buffer) {
  return reinterpret_cast<Type>(UnwrapPointer(buffer));
}
