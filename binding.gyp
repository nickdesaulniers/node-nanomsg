{
  'variables': {
    'node_addon': '<!(node -p -e "require(\'path\').dirname(require.resolve(\'addon-layer\'))")',
  },
  'targets': [
    {
      'target_name': 'node_nanomsg',
      'cflags': [ '-Wall -Werror' ],
      'cflags_cc': ['-fexceptions'],
      'ldflags': ['-ldtrace'],
      'libraries': ['-ldtrace', '-lnanomsg' ],
      'dependencies': [ '<(node_addon)/binding.gyp:addon-layer', ],
      'include_dirs': [ '<(node_addon)/include', ],
      'sources': [ 'src/node_nanomsg.c' ],
      'xcode_settings': {
          'OTHER_CPLUSPLUSFLAGS': [
              '-fexceptions',
              '-Wall',
              '-Werror',
          ],
      }
    },
  ],
}
