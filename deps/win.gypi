{
    # compiler settings to build the nanomsg library
    'defines': [
        '_WINDOWS',
        '_CRT_SECURE_NO_WARNINGS',
        'NN_HAVE_WINDOWS',
        'WIN32',
        '_WIN32',
        'NN_USE_LITERAL_IFADDR',
        'NN_SHARED_LIB',
        'NN_HAVE_STDINT',
        'NN_HAVE_WINSOCK',
        'NN_USE_WINSOCK',
    ],
    'link_settings': {
        'libraries': [
            '-lws2_32.lib',
            '-lmswsock.lib',
            '-ladvapi32',
        ],
    },
    'direct_dependent_settings': {
        # build nanomsg hub with same compiler flags as the library
        'defines': [
            '_WINDOWS',
            '_CRT_SECURE_NO_WARNINGS',
            'NN_HAVE_WINDOWS',
            'WIN32',
            '_WIN32',
            'NN_USE_LITERAL_IFADDR',
            'NN_SHARED_LIB',
            'NN_HAVE_STDINT',
            'NN_HAVE_WINSOCK',
            'NN_USE_WINSOCK',
        ],
    },
    'target_defaults': {
        'default_configuration': 'Debug',
        'configurations': {
            'Debug': {
                'defines': [ 'DEBUG', '_DEBUG' ],
                'msvs_settings': {
                    'VCCLCompilerTool': {
                        'RuntimeLibrary': 0, # shared debug
                    },
                },
            },
            'Release': {
                'defines': [ 'NDEBUG' ],
                'msvs_settings': {
                    'VCCLCompilerTool': {
                        'RuntimeLibrary': 1, # shared release
                    },
                },
            }
        },
        'msvs_settings': {
            'VCLinkerTool': {
                'GenerateDebugInformation': 'true',
            },
        },
    },
}
