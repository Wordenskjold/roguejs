define(function (require) {

		// Dependencies
		var sandbox    = require('./lib/core/sandbox'),
			Logger     = require('./lib/core/logger'),
			ExtManager = require('./lib/core/extensionManager');

		// Use a copy of our own underscore, to prevent override
		var _ = sandbox.util._;

		// Internal registries
		var appSandboxes = {}, 
			modules      = {};

		function Rogue(config) {

			if (!(this instanceof Rogue)) {
				return new Rogue();
			}

			/*---------------------------------------------------------------------------
			 * Rogue application initialization
			 *---------------------------------------------------------------------------*/
			var app = this,
				extensionManager = new ExtManager();

			// Application configuration
			app.config = config || {};

			// Unique identifier
			app.id = _.uniqueId('roguejs_application_');

			// Create new logger instance, to log messages from this application
			app.logger = new Logger(app.id, { debug: config.debug });

			// Sealed sandbox, that cannot be changed by extensions.
			// Modules directly extends the core sandbox
			app.core = Object.create(sandbox);

			// The sandbox that extensions hook into. All modules get a fresh instance of this
			app.extensibleSandbox = Object.create(sandbox);

			// Namespaces
			// Extensions extends what is available in the sandboxes. 
			// One sandbox is created for each module. 
			app.extensions = {};
			app.sandboxes  = {};

			// Add information to window, if we are in debug mode
			if (app.config.debug) {
				window.RogueApplications = window.RogueApplications || [];
				window.RogueApplications.push(app);
				app.extensionManager = extensionManager;

				// TODO: Listen for the 'started' event, and then log debug stuff
			}

			/*---------------------------------------------------------------------------
			 * Sandbox related methods
			 *---------------------------------------------------------------------------*/
			app.sandboxes.create = function (options) {
				var sandbox = Object.create(app.extensibleSandbox);

				_.extend(sandbox, options || {});

				sandbox.ref = _.uniqueId('sandbox-');
				sandbox.logger = new Logger(sandbox.ref);

				appSandboxes[sandbox.ref] = sandbox;
				return sandbox;
			};

			/*---------------------------------------------------------------------------
			 * Extension related methods
			 *---------------------------------------------------------------------------*/
			app.extensions.use = function (ref) {
				extensionManager.use(ref);
				return app;
			};

			app.extensions.remove = function (ref) {
				extensionManager.remove(ref);
				return app;
			};

			app.extensions.load = function () {
				return extensionManager.resolveExtensions();
			};

			app.extensions.initialize = function () {
				return extensionManager.initializeExtensions(app.extensibleSandbox);
			};

			/*---------------------------------------------------------------------------
			 * Rogue application API
			 *---------------------------------------------------------------------------*/
			app.start = function (el) {
				app.extensions.load().then(function (loadedExtensions) {

					// TODO: Use the mediator to fire a started event
					var exts = _(loadedExtensions).map(function (ext) { return _.pick(ext, 'extension') });

					app.logger.debug('Extensions Loaded:', exts);
					app.logger.debug('Initializing extensions...');

					app.extensions.initialize().then(function () {
						app.logger.debug('Done! All extensions have been initialized and attached to sandbox!');
					});
				});
			};

			app.stop = function () {

			};

			// Default extensions. Should be loaded relative to the extensionManager
			_(['mediator', 'backbone'])
				.chain()
				.map(function (name) { return "./../extensions/" + name + "/extension"})
				.each(app.extensions.use);

			return app;

		};

	return Rogue;

});