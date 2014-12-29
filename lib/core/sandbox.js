define(function (require) {

	var $ = require('jquery');
	var _ = require('underscore');

	if (-1 !== ([$, _].indexOf(undefined))) {
		throw new Error('Cannot create sandbox without loaded and shimmed jQuery($) and Underscore (_)');
	}

	var base = {};

	base.util = {
		$: $,
		_: _,
		deferred: $.Deferred,
		when: $.when
	}

	return base;

});
