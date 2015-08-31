var async = require('async');
var socketio = require('socket.io');
var led = require('./led');

var rpio = require('rpio');
rpio.setMode('gpio');
rpio.setOutput(25);

module.exports = function(server) {
	var io = socketio.listen(server);
	new handler({ io: io }).init();
};

var handler = function(option) {
	var _this = this;
	_this.io = option.io;

	_this.init = function() {
		_this.io.on('connection', function(socket) {
			console.log('socket connected');
			_this.listener(socket);
		});
	};

	_this.listener = function(socket) {
		socket.on('Sensor_Motion', function(data) {
			led.inputMotion(data);
		});

		socket.on('Sensor_Sound', function(data) {
			led.inputSound(data);
		});

		socket.on('Sensor_Heartrate', function(data) {
			console.log("heartrate>", data);
		});

		socket.on('Sensor_Light', function(data) {
			console.log("light>", data);
		});

		socket.on('Sensor_Proximity', function(data) {
			console.log("proximity>", data);
		});

		socket.on('Sensor_SMS', function(data) {
			console.log("sms>", data);
			async.auto({
				write: function(cb) {
					rpio.write(25, rpio.HIGH);
					cb();
				},
				sleep: ['write', function(cb) {
					setTimeout(cb, 10000);
				}]
			}, function() {
				rpio.write(25, rpio.LOW);
			});
		});

		socket.on('ping', function() {
			socket.emit('pong', true);
		});

		socket.on('disconnect', function(socket) {
			console.log('disconnect');
		});
	};

	return _this;
};
