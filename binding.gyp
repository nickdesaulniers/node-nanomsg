{
  'variables': {
  },
  'targets': [
    {
      'target_name': 'nanomsg',
      'type': 'static_library',
      'includes': [
          'common.gypi',
      ],
      'conditions': [
        ['OS=="mac"', {
            'includes': [
                'macosx.gypi',
            ]
        }],
        ['OS=="linux"', {
            'includes': [
                'linux.gypi',
            ]
        }],
        ['OS=="win"', {
            'includes': [
                'win.gypi',
            ]
        }],
      ],
    },
    {
      'target_name': 'node_nanomsg',
      'dependencies': [ 'nanomsg', ],
      'conditions': [
        ['OS=="mac"', {
          'ldflags': [ '-L<(PRODUCT_DIR)' ],
          'libraries': [ '-L<(PRODUCT_DIR)' ],
        }],
        ['OS=="linux"', {
        }],
        ['OS=="win"', {
            'cflags': [ '-Wall -Werror -Wno-unused' ],
            'cflags_cc': ['-fexceptions'],
        }],
      ],
      'include_dirs': [
        "<!(node -e \"require('nan')\")",
      ],
      'sources': [ 'src/node_nanomsg.cc' ],
      'xcode_settings': {
          'OTHER_CPLUSPLUSFLAGS': [
              '-fexceptions',
              '-Wall',
              '-Werror',
              '-Wno-unused',
          ],
      }
    },
  ],
}
