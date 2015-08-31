// Server
var app = require('express')();
app.get('/', function(req, res) {
	res.send('<h1>With Camp 2015</h1><h2>LED Love Bed</h2>');
});

var http = require('http').Server(app);
http.listen(3000, function() {
	console.log('listening on *:3000');
});

// Socket
var socket = require('./socket');
socket(http);

// Led
var led = require('./led');
led.initialize();

// Terminate
process.on('SIGINT', function () {
	ws281x.reset();
	process.nextTick(function () { process.exit(0); });
});
