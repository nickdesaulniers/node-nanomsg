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
    'direct_dependent_settings': {
        # build nanomsg hub with same compiler flags as the library
        'defines': [
            'NN_HAVE_LINUX',
            'NN_USE_EPOLL',
            'NN_HAVE_PIPE',
            'NN_HAVE_POLL',
            'NN_USE_IFADDRS',
            'NN_HAVE_MSG_CONTROL',
        ],
        'include_dirs': [
          'deps/nanomsg/src',
        ],
    }
}
