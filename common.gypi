{
    # compiler settings to build the nanomsg library
    'defines': [
        'NN_HAVE_GCC',
        'NN_HAVE_SOCKETPAIR',
        'NN_HAVE_SEMAPHORE',
        'NN_USE_PIPE',
    ],
    'direct_dependent_settings': {
        # build nanomsg hub with same compiler flags as the library
        'defines': [
            'NN_HAVE_GCC',
            'NN_HAVE_SOCKETPAIR',
            'NN_HAVE_SEMAPHORE',
            'NN_USE_PIPE',
        ],
        'include_dirs': [
          'deps/nanomsg/src',
        ],
    }
}
