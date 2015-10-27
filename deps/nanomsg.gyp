{
  'targets': [
  {
    'target_name': 'nanomsg',
    'type': 'static_library',
    'includes': [ 'common.gypi' ],
    'conditions': [
      ['OS=="mac"', {
        'includes': [ 'macosx.gypi' ]
      }],
      ['OS=="linux"', {
        'includes': [ 'linux.gypi' ]
      }],
      ['OS=="win"', {
        'includes': [ 'win.gypi' ]
      }],
    ],
  }]
}