Package.describe({
	name: 'rocketchat:theme-rp',
	version: '0.0.1',
	summary: '',
	git: '',
	documentation: 'README.md'
});

Package.onUse(function(api) {
	api.use('rocketchat:lib');
	api.use('rocketchat:logger');
	api.use('rocketchat:assets');
	api.use('coffeescript');
	api.use('less');
	api.use('underscore');
	api.use('ecmascript');
	api.use('webapp');
	api.use('webapp-hashing');
	api.use('templating', 'client');
	api.use('aldeed:template-extension@4.0.0');


	api.addFiles('client/views/accountProfileRP.html', 'client');

	api.addFiles('client/views/accountProfileRP.js', 'client');
});

Package.onTest(function(api) {
	api.use('ecmascript');
	api.use('tinytest');
	api.use('rocketchat-theme-rp');
});

Npm.depends({
	'less': 'https://github.com/meteor/less.js/tarball/8130849eb3d7f0ecf0ca8d0af7c4207b0442e3f6',
	'less-plugin-autoprefix': '1.4.2',
	'bootstrap': '3.3.7'
});