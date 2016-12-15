// Source: @tootallnate https://gist.github.com/TooTallNate/3987725
// Maintain an up-to-date copy of this file when necessary.

#pragma once

#include <nan.h>

struct nanomsg_socket_s {
  uv_poll_t poll_handle;
  uv_os_sock_t sockfd;
  Nan::Callback *callback;

  uv_mutex_t close_mutex;
  uv_mutex_t free_mutex;
  bool close_called;
  bool free_called;
};
