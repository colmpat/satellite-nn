let earth
let satellite

function setup() {
  createCanvas(800, 800)
  angleMode(DEGREES)
  earth = new Body(createVector(400,400), createVector(0,0), 75)
  satellite = new Satellite(createVector(earth.pos.x, earth.pos.y - (earth.r + 5)))
}

function draw() {
  background(180)

  earth.show()
  satellite.move()
  satellite.show()
}

function Body(_pos, _vel, _r) {
  this.pos = _pos
  this.vel = _vel
  this.r = _r

  this.mass = this.r * 9.3635 * pow(10, 20)
  // a rough ratio of earth's mass relative to radius (hyptohetical kg to km)
  /*
    m = r * c
    Earth:
    m = 5.922 * 10^24 kg
    r = 6378 km
    therefore c = m /r
      or
    c = 9.3635 x 10^20
  */

  this.show = function() {
    noStroke(); fill(40, 122, 171);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2)
  }
}

function Satellite(_pos) {
  this.pos = _pos
  this.vel = createVector(0, -.1)
  this.mass = 100 //our satellites shall be an arbitrary 100 kilos

  this.show = function() {
    stroke(0); fill(230);
    theta = this.vel.heading() + 90;

    push()
    translate(this.pos.x, this.pos.y)
    rotate(theta)
    beginShape(TRIANGLES)
    vertex(0, -5)
    vertex(-3, 5)
    vertex(3, 5)
    endShape()
    pop()
    //triangle(this.pos.x - 3, this.pos.y + 5, this.pos.x + 3, this.pos.y + 5, this.pos.x, this.pos.y - 5)
  }

  this.move = function() {
      this.pos.x += this.vel.x
      this.pos.y += this.vel.y

  }

  this.applyForce = function(force) {
    this.vel.x += force.x / this.mass
    this.vel.y += force.y / this.mass
  }

  this.rearThruster = function() {
    force = this.vel.copy()
    force.setMag(10)

    this.applyForce(force)
  }
  this.leftThruster = function() {
    this.vel.rotate(-7.5)
  }
  this.rightThruster = function() {
    this.vel.rotate(7.5)
  }
  this.frontThruster = function() {
    force = this.vel.copy()
    force.setMag(-10)

    this.applyForce(force)
  }
}


function keyPressed() {
  if(keyCode === LEFT_ARROW) {
    satellite.leftThruster()
  } else if(keyCode === RIGHT_ARROW) {
    satellite.rightThruster()
  } else if(keyCode === UP_ARROW) {
    satellite.rearThruster()
  } else if(keyCode === DOWN_ARROW) {
    satellite.frontThruster()
  }
}
