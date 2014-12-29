define(function () {
	'use strict';

	/*
	 * Roguejs logger is a wrapper around the standard console,
	 * exposing the same methods and using the if available.
	 */
	var console = window.console || {},
		noop = function () {},

		log = console.log || noop,
		debug = console.debug || log,
		warn = console.warn || log,
		error = console.error || log;

	function Logger(ref, options) {

		// Keep a reference to the caller, which is included in each message
		this.ref = ref;

		this.options = _.defaults(options || {}, {
			debug: false 
		});

		// We log messages by default
		this._enabled = true;

		return this;
	};

	// Left out of scope, to hide it from the public API
	var write = function (writer, args) {
		if (!this._enabled) return;

		// Make arguments an actual array, 
		// and add the reference to the message output
	    var args = Array.prototype.slice.call(args);
		args.unshift(this.ref + ":");

		writer.apply(console, args);
	};

	// If for some reason, we don't want log messages, we can disable it 
	Logger.prototype.disable = function () {
		this._enabled = false;
	};
	Logger.prototype.enable = function () {
		this._enabled = true;
	};
	Logger.prototype.log = function () {
		write.call(this, log, arguments);
	};
	Logger.prototype.debug = function () {
		if (!this.options.debug) return;
		write.call(this, debug, arguments);
	};
	Logger.prototype.warn = function () {
		write.call(this, warn, arguments);
	};
	Logger.prototype.error = function () {
		write.call(this, error, arguments);
	};

	return Logger;

});