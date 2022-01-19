let earth
let satellite
let orbitSlider
let G = 120

function setup() {
  createCanvas(windowWidth, windowHeight)
  angleMode(DEGREES)
  earth = new Earth(createVector(windowWidth / 2, windowHeight / 2), 65)
  satellite = new Satellite(createVector(10,10))
  orbit = new Orbit(200)
  orbitSlider = createSlider(50, min(windowWidth, windowHeight) - (2 * earth.r), 200, 10)
  orbitSlider.position(10, windowWidth - 100)
  orbitSlider.style('width', '90px')
}

function draw() {
  background(180)

  ORBIT

  earth.show()
  satellite.show()
  orbit.show()

  earth.pull(satellite)
  satellite.update()
}

function Earth(_pos, _r) {
  this.pos = _pos
  this.r = _r

  this.mass = _r * 1.25

  this.show = function() {
    noStroke(); fill(40, 122, 171);
    circle(this.pos.x, this.pos.y, this.r * 2)
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
  this.dead = false

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
    if(this.dead) {return}
    this.move()
    this.checkCollision()
  }

  this.move = function() {
      this.pos.x += this.vel.x
      this.pos.y += this.vel.y

      //update path
      this.path.push(createVector(this.pos.x,this.pos.y))
      if (this.path.length > this.vel.mag() * 25) {this.path.splice(0,1)}

  }

  this.applyForce = function(force) {
    this.vel.x += force.x / this.mass
    this.vel.y += force.y / this.mass
  }

  this.rearThruster = function() {
    if(this.dead) {return}
    force = this.vel.mag() === 0 ? createVector(0, -1) : this.vel.copy()
    force.setMag(5)

    this.applyForce(force)
  }
  this.leftThruster = function() {
    if(this.dead) {return}
    this.vel.rotate(-7.5)
  }
  this.rightThruster = function() {
    if(this.dead) {return}
    this.vel.rotate(7.5)
  }
  this.frontThruster = function() {
    if(this.dead) {return}
    force = this.vel.mag() === 0 ? createVector(0, -1) : this.vel.copy()
    force.setMag(-5)

    this.applyForce(force)
  }

  this.checkCollision = function() {
    if(this.pos.dist(earth.pos) < earth.r + 5) {
      this.dead = true
      this.mass = 0 //this negates gravitational pull
    } else if(this.pos.x < 3 || this.pos.y < 3 ||
      this.pos.x > windowWidth - 5 || this.pos.y > windowHeight - 5) {
      this.dead = true
      this.mass = 0 //this negates gravitational pull
    }
  }
}

function Orbit(_height) {
  this.r = _height + earth.r

  this.show = function() {
    noFill(); stroke(255); strokeWeight(2);
    drawingContext.setLineDash([10, 10])
    circle(windowWidth / 2, windowHeight / 2, this.r * 2)
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
