
var canvas;
var ctx;

var entities = [];
var bullets = [];
var spaceship;


//key code from nokarma.org/
var Key = {
  _pressed: {},

  SPACE: 32,
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

function Mesh(pts, fillStyle) {

  this.render = function(x, y, angle) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.fillStyle = fillStyle;
    ctx.beginPath();
    ctx.moveTo(pts[0].x,pts[0].y);
    for(var i=1; i<pts.length; ++i) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  this.renderWrapped = function(x, y, angle, rad) {
    this.render(x, y, angle);
    var lx = x - rad <= 0;
    var gx = x + rad >= canvas.width;
    var ly = y - rad <= 0;
    var gy = y + rad >= canvas.height;
    //copy paste for now...
    if(lx) {
      ctx.translate(canvas.width, 0);
      this.render(x, y, angle);
      ctx.translate(-canvas.width, 0);
    } else if(gx) {
      ctx.translate(-canvas.width, 0);
      this.render(x, y, angle);
      ctx.translate(canvas.width, 0);
    }

    if(ly) {
      ctx.translate(0, canvas.height);
      this.render(x, y, angle);
      ctx.translate(0, -canvas.height);
    } else if(gy) {
      ctx.translate(0, -canvas.height);
      this.render(x, y, angle);
      ctx.translate(0, canvas.height);
    }

    if(lx && ly) {
      ctx.translate(canvas.width, canvas.height);
      this.render(x, y, angle);
      ctx.translate(-canvas.width, -canvas.height);
    } else if(lx && gy) {
      ctx.translate(canvas.width, -canvas.height);
      this.render(x, y, angle);
      ctx.translate(-canvas.width, canvas.height);
    } else if(gx && ly) {
      ctx.translate(-canvas.width, canvas.height);
      this.render(x, y, angle);
      ctx.translate(canvas.width, -canvas.height);
    } else if(gx && gy) {
      ctx.translate(-canvas.width, -canvas.height);
      this.render(x, y, angle);
      ctx.translate(canvas.width, canvas.height);
    }
  }
}

function Bullet(life, x, y, s, v, angle, fillStyle) {
  var pts = [];
  pts.push({x:-0.5*s, y:-0.5*s});
  pts.push({x: 0.5*s, y:-0.5*s});
  pts.push({x: 0.5*s, y: 0.5*s});
  pts.push({x:-0.5*s, y: 0.5*s});
  var mesh = new Mesh(pts, fillStyle);

  this.render = function() {
    ctx.save();
    mesh.renderWrapped(x, y, angle, 1.42*s); //really sqrt 2
    ctx.restore();
  }
  this.life = function() { return life; }

  this.update = function(delta) {
    if(this.life < 0) { return; }
    life -= delta;

    var dt = delta / 1000.0;

    x = (x + dt * v * Math.cos(angle)).mod(canvas.width);
    y = (y + dt * v * Math.sin(angle)).mod(canvas.height);
    this.checkCollisions();
  }

  this.checkCollisions = function() {
    for(var i=0; i < entities.length; ++i) {
      if(entities[i] != spaceship) {
        if(entities[i].intersects(x, y)) {
          //Do something
          life = 0;
          return;
        }
      }
    }
  }
}


function Spaceship(x, y, s, fillStyle) {
  var angle = 0;
  var maxWeaponCooldown = 1000;
  var weaponCooldown = 0;

  var pts = [];
  pts.push({ x:-0.5*s, y: 0.5*s });
  pts.push({ x:-0.5*s, y:-0.5*s });
  pts.push({ x: 1.0*s, y: 0.0*s });

  var mesh = new Mesh(pts, fillStyle);

  var tailPts = [];
  var weaponCooldown = 1000;

  tailPts.push({ x:-0.5*s, y: 0.2*s });
  tailPts.push({ x:-0.5*s, y:-0.2*s });
  tailPts.push({ x:-1.0*s, y: 0.0*s });  

  var tail = new Mesh(tailPts, "rgba(200, 200, 50, 0.5)");

  this.render = function() {
    ctx.save();
    //ctx.translate(x, y);
    //ctx.rotate(angle-Math.PI/2);
    ctx.lineWidth = 3;

    //mesh.render(x, y, angle);
    mesh.renderWrapped(x, y, angle, 1.5*s);
    if(Key.isDown(Key.UP)) {
      tail.renderWrapped(x, y, angle, s);
    }

    ctx.restore();
  }

  this.update = function(delta) {
    var dt = delta / 1000;
    var turnRate = 10;
    var maxVelocity = 300;
    if(weaponCooldown > 0) {
      weaponCooldown -= delta;
    }

    if(Key.isDown(Key.LEFT)) {
      angle -= dt * turnRate;
    }
    if(Key.isDown(Key.RIGHT)) {
      angle += dt * turnRate;
    }

    if(Key.isDown(Key.UP)) {
      x += maxVelocity * dt * Math.cos(angle);
      y += maxVelocity * dt * Math.sin(angle);

      x = x.mod(canvas.width);
      y = y.mod(canvas.height);
    }
    if(Key.isDown(Key.SPACE)) {
      if(weaponCooldown <= 0) {
        bullets.push(new Bullet(2000, x, y, s/5, 500, angle, "rgba(128,128,128,0.5)"));
        weaponCooldown = maxWeaponCooldown;
      }
    }
  }
}

function Asteroid(x, y, vx, vy, rot, r, n, fillStyle) {

  var theta = 0;
  var rotation = rot;

  var pts = [];
  var dth = 2*Math.PI / n;

  var spikiness = 0.6;

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

  var mesh = new Mesh(pts, fillStyle);

  this.render = function() {
    ctx.save();
    ctx.fillStyle = fillStyle;
    ctx.lineWidth = 2;

    var rad = r * (1 + spikiness);

    mesh.renderWrapped(x, y, theta, rad);

    ctx.restore();

    ctx.save();
    ctx.beginPath();
    ctx.arc(x, y, r*(1+spikiness), 0, 2 * Math.PI);

    ctx.stroke();
    
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
  this.intersects = function(px, py) {
    var rad = r * (1 + spikiness);
    return (px - x) * (px - x) + (py - y) * (py - y) <= rad * rad;
  }
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
  for(var i=0; i < bullets.length; ++i) {
    bullets[i].update(delta);
    if(bullets[i].life() <= 0) {
      console.log("removed bullet " + i);
      bullets.splice(i,1);
      --i;
    }
  }
}

function render() {
  canvas.width = canvas.width;

  for(var i=0; i < entities.length; ++i) {
    entities[i].render();
  }
  //Render bullets separately - since they are changing quickly.
  for(var i=0; i < bullets.length; ++i) {
    bullets[i].render();

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

window.addEventListener('keyup', function(event) {
  Key.onKeyup(event); }, false);

window.addEventListener('keydown', function(event) {
  Key.onKeydown(event); }, false);

