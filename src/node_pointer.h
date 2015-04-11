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

inline static v8::Handle<v8::Value> WrapPointer(void *ptr, size_t length) {
  NanEscapableScope();
  void *user_data = NULL;
  v8::Local<v8::Object> buf =
      NanNewBufferHandle((char *)ptr, length, wrap_pointer_cb, user_data);
  return NanEscapeScope(buf);
}

/*
 * Wraps "ptr" into a new SlowBuffer instance with length 0.
 */

inline static v8::Handle<v8::Value> WrapPointer(void *ptr) {
  return WrapPointer((char *)ptr, 0);
}

/*
 * Unwraps Buffer instance "buffer" to a C `char *` with the offset specified.
 */

inline static char *UnwrapPointer(v8::Handle<v8::Value> buffer,
                                  int64_t offset) {
  if (node::Buffer::HasInstance(buffer)) {
    return node::Buffer::Data(buffer.As<v8::Object>()) + offset;
  } else {
    return NULL;
  }
}

/*
 * Unwraps Buffer instance "buffer" to a C `char *` (no offset applied).
 */

inline static char *UnwrapPointer(v8::Handle<v8::Value> buffer) {
  if (node::Buffer::HasInstance(buffer)) {
    return node::Buffer::Data(buffer.As<v8::Object>());
  } else {
    return NULL;
  }
}

/**
 * Templated version of UnwrapPointer that does a reinterpret_cast() on the
 * pointer before returning it.
 */

template <typename Type>
inline static Type UnwrapPointer(v8::Handle<v8::Value> buffer) {
  return reinterpret_cast<Type>(UnwrapPointer(buffer));
}
