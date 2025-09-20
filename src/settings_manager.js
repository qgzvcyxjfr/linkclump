var CURRENT_VERSION = "5";

function SettingsManager() {}

SettingsManager.prototype.load = function() {
	return new Promise((resolve, reject) => {
		chrome.storage.local.get(['settings'], function(result) {
			if (chrome.runtime.lastError) {
				var settings = this.init();
				settings.error = "Error: " + chrome.runtime.lastError.message;
				resolve(settings);
			} else if (result.settings) {
				try {
					resolve(typeof result.settings === 'string' ? JSON.parse(result.settings) : result.settings);
				} catch(error) {
					var settings = this.init();
					settings.error = "Error: " + error + "|Data:" + result.settings;
					resolve(settings);
				}
			} else {
				resolve(this.init());
			}
		}.bind(this));
	});
};

SettingsManager.prototype.save = function(settings) {
	// remove any error messages from object (shouldn't be there)
	if (settings.error !== undefined) {
		delete settings.error;
	}

	chrome.storage.local.set({
		'settings': settings
	});
};

SettingsManager.prototype.isInit = function() {
	return new Promise((resolve) => {
		chrome.storage.local.get(['version'], function(result) {
			resolve(result.version !== undefined);
		});
	});
};

SettingsManager.prototype.isLatest = function() {
	return new Promise((resolve) => {
		chrome.storage.local.get(['version'], function(result) {
			resolve(result.version === CURRENT_VERSION);
		});
	});
};

SettingsManager.prototype.init = function() {
	// create default settings for first time user
	var settings = {
			"actions": {
				"101": {
					"mouse": 0,  // left mouse button
					"key": 90,   // z key
					"action": "tabs",
					"color": "#FFA500",
					"options": {
						"smart": 0,
						"ignore": [0],
						"delay": 0,
						"close": 0,
						"block": true,
						"reverse": false,
						"end": false
					}
				}
			},
			"blocked": []
		};

	// save settings to store
	chrome.storage.local.set({
		'settings': settings,
		'version': CURRENT_VERSION
	});

	return settings;
};


SettingsManager.prototype.update = function() {
	return this.isInit().then((isInit) => {
		if (!isInit) {
			this.init();
		}
	});
};
