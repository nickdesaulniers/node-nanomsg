{
    # compiler settings to build the nanomsg library
    # osx ignores 'cflags' and 'CFLAGS' given to .gyp when compiling the lib
    # OTHER_CFLAGS is the trick and must be in 'xcode_settings'
    'xcode_settings': {
        'OTHER_CFLAGS': [
            '-Wno-unused',
        ],
    },
    'conditions': [
        ['asan=="true"', {
            'xcode_settings': {
                'OTHER_CFLAGS': [
                    '-fsanitize=address'
                ]
            }
        }]
    ],
    'defines': [
        'NN_HAVE_SOCKETPAIR',
        'NN_HAVE_SEMAPHORE',
        'NN_USE_PIPE',
        'NN_HAVE_CLANG',
        'NN_HAVE_OSX',
        'HAVE_PIPE',
        'NN_HAVE_PIPE',
        'NN_HAVE_POLL',
        'NN_USE_KQUEUE',
        'NN_HAVE_MSG_CONTROL',
        'NN_HAVE_UNIX_SOCKETS',
    ],
    'sources':[
        'nanomsg/src/aio/poller.c',
    ],
}
