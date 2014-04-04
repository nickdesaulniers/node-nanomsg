{
    # compiler settings to build the nanomsg library
    'defines': [
        '_WINDOWS',
        '_CRT_SECURE_NO_WARNINGS',
        'NN_HAVE_WINDOWS',
        'WIN32',
        'NN_USE_LITERAL_IFADDR',
        'NN_EXPORTS',
    ],
    'link_settings': {
        'libraries': [
            '-lws2_32.lib',
            '-lmswsock.lib',
        ],
    },
    'direct_dependent_settings': {
        # build nanomsg hub with same compiler flags as the library
        'defines': [
            '_WINDOWS',
            '_CRT_SECURE_NO_WARNINGS',
            'NN_HAVE_WINDOWS',
            'WIN32',
            'NN_USE_LITERAL_IFADDR',
            'NN_EXPORTS',
        ],
        'include_dirs': [
          'deps/nanomsg/src',
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
