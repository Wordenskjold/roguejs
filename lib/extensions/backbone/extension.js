define(function () {

	return {
		name: 'backbone',
		info: {
			description: 'Here should be a description',
			documentation: 'http://documentation.github.com',
		},
		require: {
			paths: {

			},
		},
		initialize: function (undefined, dependencies) {
			console.log('Backbone!', dependencies('test'));
		},
	};

});