var ws281x = require('rpi-ws281x-native');
// var ws281xCanvas = require('rpi-ws281x-canvas');

// module.exports = require('./lib/canvas');
var canvas = require('canvas')
var async = require('async');
var fs = require('fs');

var IMAGE_DIR = __dirname + '/data/fire';
var FPS = 10;

var canvas = require('rpi-ws281x-canvas').create(10, 10);
// var ctx = canvas.getContext('2d');

// var ws281x = require('rpi-ws281x-native'),
//     canvas = require('rpi-ws281x-canvas').create(11, 10),
//     ctx = canvas.getContext('2d');

// ws281x.init(110);

// ctx.fillStyle = 'blue';
// ctx.fillRect(1, 1, 9, 8);

// ws281x.render(canvas.toUint32Array());


var Image = canvas.Image;

function loadImages(imagePath, callback) {
    var files = fs.readdirSync(imagePath)
        .map(function(f) { return imagePath + '/' + f; });

    async.mapLimit(files, 10, fs.readFile, function(err, fileBuffers) {
        if(err) { return callback(err); }

        var images = fileBuffers.map(function(buf) {
            console.log(buf);
            console.log("@@@@@@@@@");
            console.log(canvas);
            console.log(Image);
            var img = new Image();
            img.src = buf;

            return img;
        });

        callback(null, images);
    });
}

function startRendering(images) {
    var idx = 0,
        ctx = canvas.getContext('2d');

    ws281x.init(110);
    ws281x.setIndexMapping(ws281x.indexMapping.mirrorMatrixX(11, 10));

    setInterval(function() {
        ctx.drawImage(images[idx], 0, 0, 10, 10);
        ws281x.render(canvas.toUint32Array());

        idx = (idx + 1) % images.length;
    }, 1000 / FPS);
}

loadImages(IMAGE_DIR, startRendering);