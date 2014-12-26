Package.describe({
  name: 'gliese:cfs-ui',
  version: '0.0.2',
  summary: 'Gliese extension of CollectionFS, provides UI helpers & a file insert handler',
  git: 'https://github.com/gliesesoftware/meteor-cfs-ui.git'
});

Package.on_use(function(api) {
  api.versionsFrom('METEOR@0.9.1');

  api.use([
    'gliese:cfs-base@0.0.28',
    'gliese:cfs-file@0.1.16',
    'blaze',
    'templating'
  ]);

  api.imply([
    'gliese:cfs-base'
  ]);

  api.add_files([
    'ui.html',
    'ui.js'
  ], 'client');
});

// Package.on_test(function (api) {
//   api.use(['collectionfs', 'test-helpers', 'tinytest']);
//   api.add_files('tests/client-tests.js', 'client');
// });
