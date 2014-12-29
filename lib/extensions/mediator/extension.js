define(function () {

	return {
		name: 'mediator',
		info: {
			description: 'Here should be a description',
			documentation: 'http://documentation.github.com',
		},
		require: {
			paths: {
				eventemitter: 'bower_components/eventemitter2/lib/eventemitter2',
			},
		},
		initialize: function (sandbox, dependencies) {

			var EventEmitter = dependencies('eventemitter');
			var mediator = new EventEmitter();

			sandbox.mediator = mediator;

			console.log(sandbox);
		},
	};

});