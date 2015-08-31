var ws281x = require('rpi-ws281x-native'),
    canvas = require('rpi-ws281x-canvas').create(11, 10),
    ctx = canvas.getContext('2d');

function rnd(max) { return (max || 1) * Math.random(); }
function rndi(max) { return Math.round(rnd(max)); }

ws281x.init(110);

setInterval(function() {
    ctx.globalAlpha = 1;
    ctx.fillStyle = '#' + rndi(0xffffff).toString(16);
    ctx.fillRect(rndi(10)-2, rndi(10)-2, rndi(10), rndi(10));

    // console.log(canvas.toUint32Array());

    ws281x.render(canvas.toUint32Array());
}, 100);
