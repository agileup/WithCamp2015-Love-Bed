var _ = require('lodash');
var async = require('async');
var ws281x = require('rpi-ws281x-native');

/**
 * CONSTANTS
 */
var NUM_LEDS = parseInt(process.argv[2], 10) || 110;
var WIDTH = 10;
var HEIGHT = 11;
var RESTORE_TIME = 5000;
var INTERVAL_TIME = 80;
var INIT = false;

/**
 * HELPERS
 */
function rgb2Int(r, g, b) {
	return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

function getBaseLog(x, y) {
	return Math.log(y) / Math.log(x);
}

/**
 * VARIABLES
 */
var now = _.now();

var reducer_levels = [7, 2, 1];

var white = rgb2Int(63, 63, 63);
var black = rgb2Int(0, 0, 0);
var hot = [
	rgb2Int(209, 255, 0),
	rgb2Int(232, 202, 12),
	rgb2Int(255, 172, 0),
	rgb2Int(232, 110, 12),
	rgb2Int(255, 55, 13)
];
var cold = [
	rgb2Int(110, 255, 13),
	rgb2Int(12, 232, 75),
	rgb2Int(0, 255, 230),
	rgb2Int(0, 121, 232),
	rgb2Int(14, 0, 255)
];

var pixel = new Uint32Array(NUM_LEDS);
var current_value = 1;
var current_reducer = reducer_levels[0];
var current_color = hot;

/**
 * GRAPHS
 */
var decrease_graph = function() {
	var diff = _.now() - now;
	if (diff > RESTORE_TIME && current_value > 1) {
		current_value--;
		now = _.now();
	}
};

var static_graph = function(value, callback) {
	for (var i = 0; i < NUM_LEDS; i++) {
		var col = parseInt(i / HEIGHT);
		var idx = i % HEIGHT;
		var color = black;
		if (idx < value) {
			var color_index = parseInt(idx / 2);
			// color = white;
			color = current_color[color_index];
		}

		pixel[i] = color;
	}

	ws281x.render(pixel);
	callback();
};

var sin_graph = function(wave, value, callback) {
	for (var i = 0; i < NUM_LEDS; i++) {
		// for motion
		var col = parseInt(i / HEIGHT) + wave;
		value = Math.abs(Math.floor(Math.sin(Math.PI * col/WIDTH) * HEIGHT));
		value = (value / current_reducer);

		// for sound
		var color = black;
		var idx = i % HEIGHT;
		if (idx < value) {
			var color_index = parseInt(idx / 2);
			color = current_color[color_index];
		}

		pixel[i] = color;
	}

	ws281x.render(pixel);

	setTimeout(function() { callback(); }, INTERVAL_TIME);
};

var wave_graph = function(value, callback) {
	var waves = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
	async.eachSeries(waves, function(wave, cb) {
		sin_graph(wave, value, cb);
	}, callback);
};

/**
 * INITIALIZE
 */
ws281x.init(NUM_LEDS);

setInterval(decrease_graph, RESTORE_TIME);

exports.initialize = function() {
	async.auto({
		increase: function(cb) {
			var levels = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
			async.eachSeries(levels, function(level, cb2) {
				for (var i = 0; i < NUM_LEDS; i++) {
					var col = parseInt(i / HEIGHT);
					var idx = i % HEIGHT;
					var color = black;

					if (idx <= level) {
						color = white;
					}

					pixel[i] = color;
				}

				ws281x.render(pixel);

				setTimeout(function() {
					cb2();
				}, INTERVAL_TIME);
			}, cb);
		},
		sleep: ['increase', function(cb) {
			setTimeout(function() { cb(); }, 1000);
		}]
	}, function() {
		INIT = true;
		console.log('initialized');
	});
};

/**
 * INPUT
 */
exports.inputSound = function(value) {
	// var log = getBaseLog(10, value*value);
	var log = Math.log10(value) * 1.8 + 0.7;
	current_value = (log == 0) ? 1: log;

	if (value > 1000) {
		current_reducer = reducer_levels[2];
	} else {
		current_reducer = reducer_levels[1];
	}

	if (value > 200) {
		current_color = hot;
	}

	now = _.now();
};

exports.inputMotion = function(value) {
	// var log = Math.log10(Math.abs(value + 400)) * 3.8 - 0.8;
	// current_value = (log == 0) ? 1: log;

	var size_value = 0;
	if (value > 900) {
		size_value = 2;
	} else if (value > 200) {
		size_value = 1;
	} else {
		// size_value = 0;
		size_value = 1;
	}
	current_reducer = reducer_levels[size_value];

	current_color = cold;

	now = _.now();
};

var action = function(callback) {
	if (INIT) {
		// static_graph(current_value, callback);
		wave_graph(parseInt(current_value), callback);
	} else {
		callback();
	}
};

async.forever(
	function(next) {
		async.auto({
			action: action,
			sleep: ['action', function(cb) {
				setTimeout(cb, 10);
			}]
		}, function(err) {
			if (err) {
				console.log(err);
			}

			next();
		});
	}, function(err) {
		console.log(err);
	}
);
