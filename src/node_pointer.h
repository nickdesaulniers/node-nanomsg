// Source: @tootallnate https://gist.github.com/TooTallNate/3987725
// Maintain an up-to-date copy of this file when necessary.

#pragma once

#include <nan.h>

typedef struct nanomsg_socket_s {
  uv_poll_t poll_handle;
  uv_os_sock_t sockfd;
  Nan::Callback *callback;

  uv_mutex_t close_mutex;
  bool close_called;

  uv_mutex_t free_mutex;
  bool free_called;
} nanomsg_socket_t;

// release memory of given context object when this function is called twice with the same context argument 
inline void free_context(nanomsg_socket_t *context){
  uv_mutex_lock(&context->free_mutex);
  if(context->free_called){

    delete(context->callback); 
    context->callback = NULL;

    // forget poll_handle.data because it indicate to the context itself.
    // otherwise free operation will try to release the memory of the context twice.
    context->poll_handle.data = NULL;

    uv_mutex_destroy(&context->close_mutex);

    uv_mutex_unlock(&context->free_mutex);
    uv_mutex_destroy(&context->free_mutex);
    free(context);
  }else{
    context->free_called = true;
    uv_mutex_unlock(&context->free_mutex);
  }
}

/*
 * Called when the "pointer" is garbage collected.
 */

// this function is called asynchronously at destructor when garbage collection is executed
inline static void wrap_pointer_cb(char *data, void *hint) {
  nanomsg_socket_t *context = reinterpret_cast<nanomsg_socket_t*>(data);

  // free context object if close_cb of uv_close has been called already 
  free_context(context);
}

/*
 * Wraps "ptr" into a new SlowBuffer instance with size "length".
 */

inline static v8::Local<v8::Value> WrapPointer(void *ptr, size_t length) {
  return Nan::NewBuffer(static_cast<char *>(ptr), length, wrap_pointer_cb, 0)
      .ToLocalChecked();
}

/*
 * Wraps "ptr" into a new SlowBuffer instance with length 0.
 */

inline static v8::Local<v8::Value> WrapPointer(void *ptr) {
  return WrapPointer(ptr, 0);
}

/*
 * Unwraps Buffer instance "buffer" to a C `char *` with the offset specified.
 */

inline static char *UnwrapPointer(v8::Local<v8::Value> buffer, int64_t offset) {
  if (node::Buffer::HasInstance(buffer)) {
    return node::Buffer::Data(buffer.As<v8::Object>()) + offset;
  } else {
    return 0;
  }
}

/*
 * Unwraps Buffer instance "buffer" to a C `char *` (no offset applied).
 */

inline static char *UnwrapPointer(v8::Local<v8::Value> buffer) {
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
inline static Type UnwrapPointer(v8::Local<v8::Value> buffer) {
  return reinterpret_cast<Type>(UnwrapPointer(buffer));
}
