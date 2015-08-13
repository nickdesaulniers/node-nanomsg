{
    # compiler settings to build the nanomsg library
    'defines': [
        'NN_HAVE_CLANG',
        'NN_HAVE_OSX',
        'NN_HAVE_PIPE',
        'NN_HAVE_POLL',
        'NN_USE_KQUEUE',
        'NN_USE_IFADDRS',
        'NN_USE_EVENTFD',
        'NN_HAVE_MSG_CONTROL',
    ],
    'direct_dependent_settings': {
        # build nanomsg hub with same compiler flags as the library
        'defines': [
            'NN_HAVE_CLANG',
            'NN_HAVE_OSX',
            'NN_HAVE_PIPE',
            'NN_HAVE_POLL',
            'NN_USE_KQUEUE',
            'NN_USE_IFADDRS',
            'NN_USE_EVENTFD',
            'NN_HAVE_MSG_CONTROL'
        ],
        'include_dirs': [
          'deps/nanomsg/src',
        ],
        'cflags': [
          '-O3 -D_THREAD_SAFE'
        ],
    }
}
