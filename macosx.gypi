{
    # compiler settings to build the nanomsg library
    'defines': [
        'NN_HAVE_CLANG',
        'NN_HAVE_OSX',
        'NN_USE_KQUEUE',
        'NN_HAVE_PIPE',
        'NN_HAVE_POLL',
        'NN_USE_IFADDRS',
    ],
    'direct_dependent_settings': {
        # build nanomsg hub with same compiler flags as the library
        'defines': [
            'NN_HAVE_CLANG',
            'NN_HAVE_OSX',
            'NN_USE_KQUEUE',
            'NN_HAVE_PIPE',
            'NN_HAVE_POLL',
            'NN_USE_IFADDRS',
        ],
        'include_dirs': [
          'deps/nanomsg/src',
        ],
    }
}
