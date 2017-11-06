Package.describe({
    name: 'material:admin-theme',
    version: '0.0.1',
    // Brief, one-line summary of the package.
    summary: '',
    // URL to the Git repository containing the source code for this package.
    git: '',
    // By default, Meteor will default to using README.md for documentation.
    // To avoid submitting documentation, set this field to null.
    documentation: 'README.md'
});

Package.onUse(function(api) {
  api.versionsFrom('1.4.2.3');
    api.use('ecmascript');
    // api.mainModule('admin-theme.js');
    api.addFiles([
        'fonts/open-sans/OpenSans-Bold.ttf',
        'fonts/open-sans/OpenSans-BoldItalic.ttf',
        'fonts/open-sans/OpenSans-ExtraBold.ttf',
        'fonts/open-sans/OpenSans-ExtraBoldItalic.ttf',
        'fonts/open-sans/OpenSans-Italic.ttf',
        'fonts/open-sans/OpenSans-Light.ttf',
        'fonts/open-sans/OpenSans-LightItalic.ttf',
        'fonts/open-sans/OpenSans-Regular.ttf',
        'fonts/open-sans/OpenSans-Semibold.ttf',
        'fonts/open-sans/OpenSans-SemiboldItalic.ttf',
    ], 'client', {
        isAsset: true
    });

    //  <!--Vendor CSS-->

    // api.addFiles("js/functions.js", 'client');

    // <!-- CSS -->


});

// Package.onTest(function(api) {
//   api.use('ecmascript');
//   api.use('tinytest');
//   api.use('material:admin-theme');
//   api.addFiles('admin-theme-tests.js');
// });
