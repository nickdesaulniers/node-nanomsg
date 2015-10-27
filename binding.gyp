{
  'variables': {
    'use_system_libnanomsg%': 'false',
  },
  'targets': [
    {
      'target_name': 'node_nanomsg',
      'sources': [ 'src/node_nanomsg.cc' ],
      'include_dirs': [
        "<!(node -e \"require('nan')\")",
      ],
      'conditions': [
        ['use_system_libnanomsg=="false"', {
          'dependencies': [ 'deps/nanomsg.gyp:nanomsg', ],
        }],
        ['OS=="mac"', {
          'ldflags': [ '-L<(PRODUCT_DIR)' ],
          'libraries': [ '-L<(PRODUCT_DIR)' ],
          'xcode_settings': {
            'OTHER_CPLUSPLUSFLAGS': [
              '-fexceptions',
              '-Wall',
              '-Werror'
            ]
          }
        }],
        ['OS=="linux" and use_system_libnanomsg=="true"', {
          'include_dirs+': [
            '<!@(pkg-config libnanomsg --cflags-only-I | sed s/-I//g)',
          ],
          'libraries': [
            '<!@(pkg-config libnanomsg --libs)',
          ],
        }],
        ['OS=="win"', {
          'cflags': [ '-Wall -Werror -Wno-unused' ],
          'cflags_cc': ['-fexceptions'],
        }],
      ],
    },
  ],
}
