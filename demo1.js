
var canvas;
var ctx;

var entities = [];

function GameEntity(x, y, r, vx, vy, fillStyle) {
	this.x = x;
	this.y = y;
	this.vx = vx;
	this.vy = vy;
	this.fillStyle = fillStyle;


	this.render = function() {
		ctx.save();
		ctx.translate(x, y);
		ctx.fillStyle = fillStyle;
		ctx.lineWidth = 5;

		ctx.beginPath();
		ctx.arc(0, 0, r, 0, 2 * Math.PI);
		ctx.fill();
		ctx.stroke();
		ctx.closePath();	
		ctx.restore();
	}

	this.update = function(delta) {
	var dt = (delta/1000.);
		x += dt * vx;
		y += dt * vy

		if(x - r < 0) { x = r; vx *= -1; }
		if(x + r >= canvas.width) { x = canvas.width - r; vx *= -1 }
		if(y - r < 0) { y = r; vy *= -1; }
		if(y + r >= canvas.height) { y = canvas.height - r; vy *= -1 }		
	}
}

function init() { 
	canvas = document.getElementById("canvas");
	ctx    = canvas.getContext("2d");
	
	for(var i=0; i<100; ++i) {
		var r = Math.floor(255 * Math.random());
		var g = Math.floor(255 * Math.random());
		var b = Math.floor(255 * Math.random());
		var a = Math.random();
		var color = "rgba(" + r + "," + g + "," + b + "," + a + ")";
		entities.push(new GameEntity(canvas.width*Math.random(), canvas.height*Math.random(), 40*Math.random(), 200*Math.random() - 100, 200*Math.random() - 100,
			color));
	}
}


var lastTick = Date.now();

function update(delta) {
	for(var i=0; i < entities.length; ++i) {
		entities[i].update(delta);
	}
}

function render() {

	canvas.width = canvas.width;

	for(var i=0; i < entities.length; ++i) {
		entities[i].render();
	}
}

function main() {
	var currentTick = Date.now();
	var delta = currentTick - lastTick;
	update(delta);

	render();

	lastTick = currentTick;

}
setInterval(main, 1);