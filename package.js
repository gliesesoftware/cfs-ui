Package.describe({
  name: 'gliese:cfs-ui',
  version: '0.0.1',
  summary: 'Gliese extension of CollectionFS, provides UI helpers & a file insert handler',
  git: 'https://github.com/gliesesoftware/meteor-cfs-ui.git'
});

Package.on_use(function(api) {
  api.versionsFrom('METEOR@0.9.1');

  api.use([
    'cfs:base-package@0.0.0',
    'cfs:file@0.0.0',
    'blaze',
    'templating'
  ]);

  api.imply([
    'cfs:base-package'
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
