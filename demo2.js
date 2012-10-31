
var canvas, ctx;

function init() {
	canvas = document.getElementById("canvas");
	ctx    = canvas.getContext("2d");	
	update();
}

function serpinski(c, n, x, y, len) {
	//Sub-divide the triangle with sides of length len into triangles, stop ta depth 0.
	c.save();
		c.translate(x, y);	
		c.scale(len, len);
		draw(c, n);
	c.restore();

	function draw(c, n) {	
		
		drawTriangle();

		if(n > 0) {
			c.save();
				c.scale(0.5, 0.5);
				draw(c, n-1);

				c.translate(1,0);
				draw(c, n-1);

				c.translate(-1, 0);
				c.translate(Math.cos(Math.PI/3), -Math.sin(Math.PI/3));
				draw(c, n-1);

			c.restore();
		}
	}

	function drawTriangle() {
		c.save();
			c.moveTo(0, 0);
			c.lineTo(1, 0);
			c.rotate(-(1/3)*Math.PI);
			c.lineTo(1,0);
			c.closePath();
		c.restore();
	}
}

function update() {
	canvas.width = canvas.width;

	var angle = Math.PI * 2.0 * (new Date().getTime() % 1000) / 1000.0;

	var x = 200;
	var y = 400;
	var len = 400;
	
	/*
	var dx = len/2;
	var dy = Math.sqrt(len*len*3/4)/2;

	ctx.translate((x+dx),y-dy);
	ctx.rotate(angle);
	ctx.translate(-(x+dx),-(y-dy));
	*/
	serpinski(ctx, 5, x, y, len);

	ctx.stroke();
}

//setInterval(update, 1);