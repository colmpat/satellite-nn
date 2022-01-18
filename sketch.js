let earth
let satellite
let G = 120

function setup() {
  createCanvas(windowWidth, windowHeight)
  angleMode(DEGREES)
  earth = new Body(createVector(windowWidth / 2, windowHeight / 2), 75)
  satellite = new Satellite(createVector(0,0))
}

function draw() {
  background(180)

  earth.show()
  satellite.show()

  earth.pull(satellite)
  satellite.update()
}

function Body(_pos, _r) {
  this.pos = _pos
  this.r = _r

  this.mass = _r

  this.show = function() {
    noStroke(); fill(40, 122, 171);
    ellipse(this.pos.x, this.pos.y, this.r * 2, this.r * 2)
  }

  this.pull = function(body) {
    force = (this.pos.copy()).sub(body.pos)
    dist = this.pos.dist(body.pos)
    mag = (G * this.mass * body.mass) / (dist * dist)

    force.setMag(mag)

    body.applyForce(force)
  }
}

function Satellite(_pos) {
  this.pos = _pos
  this.vel = createVector(0, 0)
  this.mass = 10 //our satellites shall be an arbitrary 10 kilos
  this.path = []

  this.show = function() {

    for (let i = 0; i < this.path.length-2; i++) {
      stroke(0, i)
      line(this.path[i].x, this.path[i].y, this.path[i+1].x, this.path[i+1].y,)
    }

    stroke(0); fill(230);
    theta = this.vel.mag() === 0 ? 0 : (this.vel.heading() + 90)

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

  this.update = function() {
    this.move()
  }

  this.move = function() {
      this.pos.x += this.vel.x
      this.pos.y += this.vel.y

      //update path
      this.path.push(createVector(this.pos.x,this.pos.y))
      if (this.path.length > 200) this.path.splice(0,1)

  }

  this.applyForce = function(force) {
    this.vel.x += force.x / this.mass
    this.vel.y += force.y / this.mass
  }

  this.rearThruster = function() {
    force = this.vel.mag() === 0 ? createVector(0, -1) : this.vel.copy()
    force.setMag(5)

    this.applyForce(force)
  }
  this.leftThruster = function() {
    this.vel.rotate(-7.5)
  }
  this.rightThruster = function() {
    this.vel.rotate(7.5)
  }
  this.frontThruster = function() {
    force = this.vel.mag() === 0 ? createVector(0, -1) : this.vel.copy()
    force.setMag(-5)

    this.applyForce(force)
  }
  this.touching = function(body) {
    if(this.pos.dist(body.pos) < body.r + 5) {
      return true
    }
  }
}

function Orbit(_height) {

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
