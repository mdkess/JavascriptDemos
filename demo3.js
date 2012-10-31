
var canvas, ctx;
var degree;
var targetDegree;
var depth;
var size;

function init() {
	canvas = document.getElementById("canvas");
	ctx    = canvas.getContext("2d");	

	var vars = location.search.substring(1).split("&");
	depth = 3;
	size = 100;
	for(var i = 0; i < vars.length; ++i) {
		var t = vars[i].split("=");
		if(t.length == 2) {
			if(t[0] == "d") {
				targetDegree = Math.floor(t[1]);
			} else if(t[0] == "r") {
				depth = Math.floor(t[1]);
			} else if(t[0] == "s") {
				size = Math.floor(t[1]);
			}
		}
	}
	degree = targetDegree - 1 + 0.001;	

	update();
}

//c: graphics context
//n: depth of recursion
//d: degree of flake
//x, y: location
//len: edge length
function koch(c, n, d, x, y, len) {
	//Sub-divide the triangle with sides of length len into triangles, stop ta depth 0.
	c.save();
	c.translate(x, y);	
	c.scale(len, len);
	var theta = 2*Math.PI / d;
	for(var i=0; i<d; ++i) {
		draw(c, n);
		c.rotate(theta);
	}
	c.restore();
	//c.closePath();

	function draw(c, n) {	

		if(n == 0) {
			c.moveTo(0, 0);
			c.lineTo(1, 0);
			
		} else {
			c.save();
			c.scale(1/3, 1/3);
			
			draw(c, n-1);
			c.rotate(theta-Math.PI);
			draw(c, n-1);
			
			//d - 2 other rotations
			for(var i=0; i<d-2; ++i) {
				c.rotate(theta)
				draw(c, n-1);
			}

			c.rotate(theta-Math.PI)
			draw(c, n-1);
			c.restore();
		}
		c.translate(1,0);
	}
}


var lastTick = new Date();
function update() {

	function rotateAbout(x, y, theta) {
		ctx.translate(x, y);
		ctx.rotate(theta);
		ctx.translate(-x, -y);
	}

	var start = new Date();

	var currentTick = new Date();
	var dt = (currentTick - lastTick)/1000.0;

	lastTick = currentTick;

	canvas.width = canvas.width;

	var x = 200;
	var y = 200;
	var len = size;
	
	var dx = len/2;
	var dy = len/2;

	var s = 200;

	degree += dt;
	if(degree > targetDegree) {
		degree = targetDegree;
	}

	koch(ctx, depth, degree, x, y, len);

	ctx.stroke();
	var delta = new Date() - start;
	//console.log("rendering took " + delta + "ms");
	
}

setInterval(update, 1);

