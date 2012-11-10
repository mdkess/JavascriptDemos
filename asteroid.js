
var canvas;
var ctx;

var entities = [];
var spaceship;


//key code from nokarma.org/
var Key = {
  _pressed: {},

  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,

  isDown: function(keyCode) {
    return this._pressed[keyCode];
  },

  onKeydown: function(event) {
    this._pressed[event.keyCode] = true;
  },

  onKeyup: function(event) {
    this._pressed[event.keyCode] = false;
  }
};

//javascript mod is broken
Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
}

function Spaceship(x, y, s, fillStyle) {
  var angle = Math.PI/4;

  this.render = function() {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.lineWidth = 0.2;
    ctx.scale(s, s);
    ctx.fillStyle = fillStyle;

    ctx.beginPath();

    ctx.moveTo(-0.5, -0.5);

    ctx.lineTo( 0.5, -0.5);
    ctx.lineTo( 0.0,  1.0);

    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    ctx.restore();
  }

  this.update = function(delta) {
    var dt = delta / 1000;
    var turnRate = 10;
    if(Key.isDown(Key.LEFT)) {
      angle -= dt * turnRate;
    }
    if(Key.isDown(Key.RIGHT)) {
      angle += dt * turnRate;
    }
  }

}

function Asteroid(x, y, vx, vy, rot, r, n, fillStyle) {

  var theta = 0;
  var rotation = rot;

  var pts = [];
  var dth = 2*Math.PI / n;

  var spikiness = 1;

  /**
   *  IDEA: Generate a bunch of points along a circle, and permute them
   */
  for(var i=0; i<n; ++i) {
    var f  = spikiness*Math.random() + 1;
    var t  = Math.random()*dth
    var px = Math.cos(i*dth - dth/2 + t) * r * f;
    var py = Math.sin(i*dth - dth/2 + t) * r * f;

    pts.push({ x:px, y:py });
  }



  this.render = function() {
    ctx.save();
    ctx.translate(x, y);
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = 2;

    var draw = function() {

      ctx.save();
      ctx.beginPath();
      ctx.rotate(theta);
      ctx.moveTo(pts[0].x,pts[0].y);
      for(var i=1; i<pts.length; ++i) {
        ctx.lineTo(pts[i].x, pts[i].y);
      }

      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    draw();

    var rad = r * (1 + spikiness);
    ctx.save();

    var lx = x - rad <= 0;
    var gx = x + rad >= canvas.width;
    var ly = y - rad <= 0;
    var gy = y + rad >= canvas.height;

    //copy paste for now...
    if(lx) {
      ctx.translate(canvas.width, 0);
      draw();
      ctx.translate(-canvas.width, 0);
    } else if(gx) {
      ctx.translate(-canvas.width, 0);
      draw();
      ctx.translate(canvas.width, 0);
    }

    if(ly) {
      ctx.translate(0, canvas.height);
      draw();
      ctx.translate(0, -canvas.height);
    } else if(gy) {
      ctx.translate(0, -canvas.height);
      draw();
      ctx.translate(0, canvas.height);
    }

    if(lx && ly) {
      ctx.translate(canvas.width, canvas.height);
      draw();
      ctx.translate(-canvas.width, -canvas.height);
    } else if(lx && gy) {
      ctx.translate(canvas.width, -canvas.height);
      draw();
      ctx.translate(-canvas.width, canvas.height);
    } else if(gx && ly) {
      ctx.translate(-canvas.width, canvas.height);
      draw();
      ctx.translate(canvas.width, -canvas.height);
    } else if(gx && gy) {
      ctx.translate(-canvas.width, -canvas.height);
      draw();
      ctx.translate(canvas.width, canvas.height);
    }

    ctx.restore();

    /*
    ctx.beginPath();
    ctx.arc(0, 0, r*(1+spikiness), 0, 2 * Math.PI);

    ctx.stroke();
    */
    ctx.restore();
  } //render();

  this.update = function(delta) {
    var dt = delta/1000;

    x += dt * vx;
    y += dt * vy;

    theta += dt * rotation;

    x = x.mod(canvas.width);
    y = y.mod(canvas.height);

  } //update();
}

function init() {
  canvas = document.getElementById("canvas");
  ctx    = canvas.getContext("2d");
  for(var i=0; i<10; ++i) {
    var r = Math.floor(255 * Math.random());
    var g = Math.floor(255 * Math.random());
    var b = Math.floor(255 * Math.random());
    var a = Math.random();
    var x = canvas.width * Math.random();
    var y = canvas.height * Math.random();
    var vx = -100 + 200 * Math.random();
    var vy = -100 + 200 * Math.random();
    var rot = -0.5 + Math.random();
    var rad = 30 + 20 * Math.random();
    var color = "rgba(" + r + "," + g + "," + b + "," + a + ")";

    entities.push(new Asteroid(x, y, vx, vy, rot, rad, 20, color));
  }
  //Create a player entity
  spaceship = new Spaceship(canvas.width/2, canvas.height/2, 30, "rgba(10,50,200,0.5)");

  entities.push(spaceship);
}


var lastTick = Date.now();

var paused = false;

function update(delta) {
  if(paused) return;
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

document.onkeypress = function(e) {
  paused = !paused;
  console.log("Toggled pause to " + paused);
}

function main() {
  var currentTick = Date.now();
  var delta = currentTick - lastTick;
  update(delta);

  render();

  lastTick = currentTick;

}
setInterval(main, 1);

window.addEventListener('keyup', function(event) {
  Key.onKeyup(event); }, false);

window.addEventListener('keydown', function(event) {
  Key.onKeydown(event); }, false);

