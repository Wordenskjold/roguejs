define(function (_require) {

	var Logger = _require('./logger'),
		core   = _require('./sandbox');

	var logger   = new Logger('ExtensionManager'),
		deferred = core.util.deferred,
		when = core.util.when;

	var extensionsToLoad = [],
		resolvedExtensionData = [];

	var loadExtension = function (ext) {
		var dfd = deferred();
		var basePath = './../extensions/' + ext.name + '/';

		var resolved = function () {
			var args = Array.prototype.slice.call(arguments);
			var dependencyList = _.object(_.keys(ext.require.paths), args);

			var dependencyGetter = function (name) {return dependencyList[name] };
			dfd.resolve({ extension: ext, dependencyGetter: dependencyGetter }); 
		};

		if (!ext.require || !ext.require.paths) {
			throw new Error('Not yet suppoted: Extension without dependencies');
		}

		var paths = _(ext.require.paths).values().map(function (extPath) { return basePath + extPath });

		_require(paths, resolved);

		return dfd.promise();
	};

	var resolveError = function () {
		throw new Error("Extensions already resolved");	
	};

	function ExtensionManager() {
		this.extensions = [];
		this.resolved = false;
		this.initialized = false;
		return this;
	};

	ExtensionManager.prototype.use = function (ref) {
		if (this.resolved) resolveError();

		if (_(extensionsToLoad).contains(ref)) return;
		extensionsToLoad.push(ref);
	};

	ExtensionManager.prototype.remove = function (ref) {
		extensionsToLoad = _(extensionsToLoad).without(ref);
	};

	ExtensionManager.prototype.resolveExtensions = function () {
		if (this.resolved) resolveError();

		var manager = this,
		dfd = deferred();

		_require(extensionsToLoad, function () {
			var extensions = Array.prototype.slice.call(arguments);

			(function _loadExtensions(exts) {
				if (0 === exts.length) {
					manager.resolved = true;
					dfd.resolve(resolvedExtensionData);
				}
				else {
					loadExtension(extensions.shift()).then(function (extensionData) {
						resolvedExtensionData.push(extensionData);
						_loadExtensions.call(undefined, extensions);
					});
				}
			})(extensions);
		});
		return dfd.promise();
	};

	ExtensionManager.prototype.initializeExtensions = function (sandbox) {
		if (!this.resolved) throw new Error("Extensions not resolved");
		if (this.initialized) throw new Error("Extensions already initialized");

		var manager = this,
			dfd = deferred();

		(function _initializeExtensions(extData) {
			if (0 === extData.length) {

				manager.initialized = true;
				dfd.resolve();
			}
			else {
				var data = extData.shift(),
					ext  = data.extension,
					deps = data.dependencyGetter;
				var init = when(ext.initialize.call(ext, sandbox, deps));
				init.done(function () {
					_initializeExtensions(extData);
				});
			}
		})(resolvedExtensionData);

		return dfd.promise();
	};


	return ExtensionManager;

});