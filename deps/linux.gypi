{
    # compiler settings to build the nanomsg library
    'defines': [
        'NN_HAVE_LINUX',
        'NN_USE_EPOLL',
        'NN_HAVE_PIPE',
        'NN_HAVE_POLL',
        'NN_USE_IFADDRS',
        'NN_HAVE_MSG_CONTROL',
    ],
    'cflags': [ '-O3', '-Wall', '-Wextra', '-Wno-sign-compare', '-Wno-unused',
        '-Wno-strict-aliasing', '-Wno-char-subscripts', '-Wno-maybe-uninitialized',
    ],
    'direct_dependent_settings': {
        'defines': [
            'NN_HAVE_LINUX',
            'NN_USE_EPOLL',
            'NN_HAVE_PIPE',
            'NN_HAVE_POLL',
            'NN_USE_IFADDRS',
            'NN_HAVE_MSG_CONTROL',
        ],
        'include_dirs': [
          'nanomsg/src',
        ],
    }
}
