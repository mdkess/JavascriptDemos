
var canvas, ctx;
var degree;
var targetDegree;
var depth;
var size;

function init() {
	canvas = document.getElementById("canvas");
	ctx    = canvas.getContext("2d");	
}

function drawClock() {
	var now = new Date();
	var r = 50;
	var x = canvas.width / 2;
	var y = canvas.height / 2;

	var hours   = now.getHours();
	var minutes = now.getMinutes();
	var seconds = now.getSeconds();
	var millis  = now.getMilliseconds();

	var day   = now.getDate();
	//day = 14;
	var month = now.getMonth();

	var width = 5;

	ctx.lineWidth = 5;
	ctx.beginPath();
	ctx.fillStyle = 'rgb(220,210,190);';
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.stroke();
	ctx.fill();

	ctx.beginPath();
	ctx.fillStyle = 'rgb(255,255,255);';
	ctx.arc(x, y, r-width, 0, 2 * Math.PI);
	

	ctx.stroke();
	ctx.fill();

	ctx.fillStyle = 'rgb(220,210,190);';

	var pctHours = ((hours % 12) * 60 + minutes) / (12 * 60 - 1);
	var pctMinutes = (60 * minutes + seconds) / (60 * 60 - 1);
	var pctSeconds = (seconds*1000+millis) / 59999;

	draw(pctHours, r/5);
	ctx.stroke();
	draw(pctMinutes, r/7);
	ctx.stroke();
	draw(pctSeconds, r/11);
	ctx.stroke();
	
	draw(pctHours, r/5);
	ctx.fill();
	draw(pctMinutes, r/7);
	ctx.fill();
	draw(pctSeconds, r/11);
	ctx.fill();
	ctx.font = 'bold 60px Consolas';
	ctx.fillStyle = 'rgb(0, 0, 0);';
	ctx.fillText(day, x - 30, y + 15);
	ctx.font = 'bold 18px Consolas';
	var months = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
	ctx.fillText(months[month], x, y + 30);



	//Draw inner circles
	/*
	var offset = r/10;
ctx.lineWidth = 4;
	ctx.fillStyle = 'rgb(128,200,128);';
	draw(pctHours, r/3 - offset);
	ctx.stroke();
	ctx.fillStyle = 'rgb(128,128,200);';
	draw(pctMinutes, r/5 - offset);
	ctx.stroke();
	ctx.fillStyle = 'rgb(200,128,128);';
	draw(pctSeconds, r/7 - offset);
	ctx.stroke();

	ctx.fillStyle = 'rgb(128,200,128);';
	draw(pctHours, r/3 - offset);
	ctx.fill();
	ctx.fillStyle = 'rgb(128,128,200);';
	draw(pctMinutes, r/5 - offset);
	ctx.fill();
	ctx.fillStyle = 'rgb(200,128,128);';
	draw(pctSeconds, r/7 - offset);
	ctx.fill();
*/
	//Draw percentage from 12 o'clock (0 is 12, 1 is 11:59.59...)
	function draw(pct, rad) {
		var angle = (Math.PI * 2) * pct - Math.PI / 2;
		ctx.beginPath();
		ctx.arc(x + (r-width/2) * Math.cos(angle), y + (r-width/2) * Math.sin(angle), rad, 0, 2 * Math.PI);
	}
}


function update() {
	canvas.width = canvas.width; //clear
	drawClock();	
}

setInterval(update, 1);

