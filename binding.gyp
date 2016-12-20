{
  'variables': {
    'use_system_libnanomsg%': 'false',
    'asan': 'false',
  },
  'targets': [
    {
      'target_name': 'node_nanomsg',
      'sources': [
        'src/node_nanomsg.cc',
        'src/poll_ctx.cc'
      ],
      'include_dirs': [
        "<!(node -e \"require('nan')\")",
      ],
      'conditions': [
        ['use_system_libnanomsg=="false"', {
          'dependencies': [ 'deps/nanomsg.gyp:nanomsg', ],
        }],
        ['OS=="linux" and use_system_libnanomsg=="true"', {
          'include_dirs+': [
            '<!@(pkg-config nanomsg --cflags-only-I | sed s/-I//g)/nanomsg  || echo "")',
            '<!@(pkg-config libnanomsg --cflags | sed s/-I//g || echo "")',
          ],
          'libraries': [
            '<!@(pkg-config nanomsg --libs || echo "")',
            '<!@(pkg-config libnanomsg --libs || echo "")',
          ],
        }],
        ['OS=="mac" and use_system_libnanomsg=="true"', {
          'include_dirs+': [
            '<!@(pkg-config libnanomsg --cflags | sed s/-I//g || echo "")',
            '<!@(pkg-config nanomsg --cflags | sed s/-I//g || echo "")',
          ],
          'libraries': [
            '<!@(pkg-config libnanomsg --libs || echo "")',
            '<!@(pkg-config nanomsg --libs || echo "")',
          ],
        }],
        ['OS=="mac" and asan=="true"', {
          'xcode_settings': {
            'OTHER_LDFLAGS': [
              '-fsanitize=address'
            ]
          }
        }],
        ['OS=="win"', {
          'cflags': [ '-Wall -Werror -Wno-unused' ],
          'cflags_cc': ['-fexceptions'],
        }],
      ],
    },
  ],
}
