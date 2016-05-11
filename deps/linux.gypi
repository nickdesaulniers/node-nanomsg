{
    # compiler settings to build the nanomsg library
    'defines': [
        'NN_HAVE_GCC',
        'NN_HAVE_LINUX',
        'NN_HAVE_EVENTFD',
        'NN_USE_EPOLL',
        'NN_HAVE_PIPE',
        'NN_HAVE_PIPE2',
        'NN_HAVE_CLOCK_MONOTONIC',
        'NN_HAVE_POLL',
        'NN_USE_EPOLL',
        'NN_HAVE_GCC_ATOMIC_BUILTINS',
        'NN_HAVE_MSG_CONTROL',
        'NN_USE_EVENTFD',
    ],
    'cflags': [ '-O3', '-Wall', '-Wextra', '-Wno-sign-compare', '-Wno-unused',
        '-Wno-strict-aliasing', '-Wno-char-subscripts', '-Wno-maybe-uninitialized',
        '-Wno-implicit-function-declaration', '-lpthread',
    ],
    'direct_dependent_settings': {
        'defines': [
            'NN_HAVE_GCC',
            'NN_HAVE_LINUX',
            'NN_HAVE_EVENTFD',
            'NN_USE_EPOLL',
            'NN_HAVE_PIPE',
            'NN_HAVE_PIPE2',
            'NN_HAVE_CLOCK_MONOTONIC',
            'NN_HAVE_POLL',
            'NN_USE_EPOLL',
            'NN_HAVE_GCC_ATOMIC_BUILTINS',
            'NN_HAVE_MSG_CONTROL',
            'NN_USE_EVENTFD',
        ],
        'include_dirs': [
          'nanomsg/src',
        ],
    }
}
