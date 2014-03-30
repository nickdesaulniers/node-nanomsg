{
    # compiler settings to build the nanomsg library
    'defines': [
        'NN_HAVE_LINUX',
        'NN_USE_EPOLL',
    ],
    'direct_dependent_settings': {
        # build nanomsg hub with same compiler flags as the library
        'defines': [
        'NN_HAVE_LINUX',
        'NN_USE_EPOLL',
        ],
        'include_dirs': [
          'deps/nanomsg/src',
        ],
    }
}
