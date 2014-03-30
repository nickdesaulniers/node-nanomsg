{
    # compiler settings to build the nanomsg library
    'defines': [
    ],
    'direct_dependent_settings': {
        # build nanomsg hub with same compiler flags as the library
        'defines': [
        ],
        'include_dirs': [
          'deps/nanomsg/src',
        ],
    }
}
