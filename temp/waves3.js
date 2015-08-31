var sleep = require('sleep');
var ws281x = require('rpi-ws281x-native'),
    canvas = require('rpi-ws281x-canvas').create(11, 10),
    ctx = canvas.getContext('2d');

function rnd(max) { return (max || 1) * Math.random(); }
function rndi(max) { return Math.round(rnd(max)); }

var NUM_LEDS = parseInt(process.argv[2], 10) || 110;
var INTERVAL = 60;

ws281x.init(NUM_LEDS);
var pixel = new Uint32Array(NUM_LEDS);

var offset = 0;
var x = 10;
var y = 11;

var rainbow_color = [
	[255, 0, 0],
	[255, 127, 0],
	[255, 255, 0],
	[0, 255, 0],
	[0, 255, 127],
	[0, 255, 255],
	[0, 127, 255],
	[0, 0, 255],
	[127, 0, 255],
	[255, 0, 255]
];

var wave0 = [9, 7, 5, 3, 2, 1, 1, 1, 1, 1];
var wave1 = [7, 9, 7, 5, 3, 2, 1, 1, 1, 1];
var wave2 = [5, 7, 9, 7, 5, 3, 2, 1, 1, 1];
var wave3 = [3, 5, 7, 9, ];
var wave5 = [1, 2, 4, 6, 8, 10, 7, 5, 3, 2];

function rgb2Int(r, g, b) {
	return ((r & 0xff) << 16) + ((g & 0xff) << 8) + (b & 0xff);
}

var timer = 0;
var step = 0;
var temp = function () {
	for (var i = 0; i < NUM_LEDS; i++) {
		var col = parseInt(i / 11);
		var idx = i % 11;
		var value = wave1[col];
		var color = rgb2Int(0, 0, 0);
		if (idx < value && col <= step) {
			color = rgb2Int(127, 0, 255);
		}
		
		pixel[i] = color;
	}

	step = (step + 1) % 10;

	if (step === 9) {
		sleep.usleep(1000);
	}

	ws281x.render(pixel);
}

var rect = function() {
	// ctx.globalAlpha = 0.1;
    // ctx.fillStyle = '#' + rndi(0xffffff).toString(16);
    ctx.fillStyle = 'red';
    // ctx.fillRect(rndi(10)-2, rndi(10)-2, rndi(10), rndi(10));
    // ctx.fillRect(0, 0, x++, 1);
    ctx.fillRect(0, 0, 10-0, 12-y);
    y--;
    x--;

    ws281x.render(canvas.toUint32Array());
};

setInterval(temp, INTERVAL);

// ws281x.init(110);

// ctx.fillStyle = 'blue';


// ws281x.render(canvas.toUint32Array());
