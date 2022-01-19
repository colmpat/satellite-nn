let earth
let population
let orbit
let orbitSlider
let G = 120

function setup() {
  createCanvas(windowWidth, windowHeight)
  angleMode(DEGREES)
  earth = new Earth(createVector(windowWidth / 2, windowHeight / 2), 65)
  population = new Population(10)
  orbit = new Orbit(200)

  orbitSlider = createSlider(earth.r + 75, min(windowWidth, windowHeight) / 2 - 20, 150, 5);
  orbitSlider.position(windowWidth - 100, 10);
  orbitSlider.style('width', '90px');
}

function draw() {
  let r = orbitSlider.value()
  orbit.r = r
  background(180)

  earth.show()
  population.show()
  orbit.show()

  earth.pull(population)
  population.update()
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Earth
function Earth(_pos, _r) {
  this.pos = _pos
  this.r = _r

  this.mass = _r * 1.25

  this.show = function() {
    noStroke(); fill(40, 122, 171);
    circle(this.pos.x, this.pos.y, this.r * 2)
  }

  this.pull = function(population) {
    for(let i = 0; i < population.size; i++) {
      body = population.population[i]

      force = (this.pos.copy()).sub(body.pos)
      dist = this.pos.dist(body.pos)
      mag = (G * this.mass * body.mass) / (dist * dist)

      force.setMag(mag)

      body.applyForce(force)
    }

  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Satellite
function Satellite(_pos) {
  this.pos = _pos
  this.vel = createVector(0, 0)
  this.mass = 10 //our satellites shall be an arbitrary 10 kilos
  this.path = []
  this.dead = false

  this.show = function() {

    drawingContext.setLineDash([])

    for (let i = 0; i < this.path.length-2; i++) {
      stroke(0, i); strokeWeight((i * 2.5) / (this.path.length - 2));
      line(this.path[i].x, this.path[i].y, this.path[i+1].x, this.path[i+1].y,)
    }

    stroke(0); fill(230); strokeWeight(1.5);
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
      if (this.path.length > this.vel.mag() + 150) {this.path.splice(0,1)}

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
    this.vel.rotate(-5)
  }
  this.rightThruster = function() {
    if(this.dead) {return}
    this.vel.rotate(5)
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
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Orbit goal
function Orbit(_height) {
  this.r = _height + earth.r

  this.show = function() {
    noFill(); stroke(255); strokeWeight(2);
    drawingContext.setLineDash([10, 10])
    circle(windowWidth / 2, windowHeight / 2, this.r * 2)
  }
}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//Satellite Brain
function Brain(_satellite) {

  this.moves = []

  this.satellite = _satellite

  this.alt = this.satellite.pos.dist(earth.pos) - earth.r
  this.velMag = this.satellite.vel.mag()
  this.velHeading = this.satellite.vel.heading()
  this.satellitePositionalDegree = (this.satellite.pos.copy().sub(earth.pos)).heading() //the heading of the vector from earth to the satellite

  //input layer (5 nodes):
  /*
    we shall take into consideration:

    height of goal orbit
    current height above earth
    current velocity magnitude
    current heading
    current heading from center of earth to satellite

  */

  //hidden layer (4 nodes)

  //output layer (4 nodes)
  /*
    rearThruster
    frontThruster
    leftThruster
    rightThruster
  */

  //for now
  this.randomize = function() {
    for(let i = 0; i < 150; i++) {
      choices = [this.satellite.rearThruster, this.satellite.frontThruster, this.satellite.leftThruster, this.satellite.rightThruster, null]
      rand = random(0, 5)
      this.moves[i] = choices[rand]
    }
  }
  this.mutate = function() {
    mutationRate = 0.01
    for(let i = 0; i < 150; i++) {
      randomRate = random(1.0)
      if(randomRate < mutationRate) {
        choices = [this.satellite.rearThruster, this.satellite.frontThruster, this.satellite.leftThruster, this.satellite.rightThruster, null]
        rand = random(0, 5)
        this.moves[i] = choices[rand]
      }
    }
  }


}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~


//Population
function Population(_size) {

  this.size = _size
  this.population = []

  this.generation = 1
  this.indexOfBestSatellite = 0

  for(let j = 0; j < size; j++) {
    population[j] = new Satellite(createVector(10, windowHeight / 2))
  }

  this.show = function() {
    for(let i = 0; i < size; i++) {
      population[i].show()
    }
  }

  this.update = function() {
    for(let i = 0; i < size; i++) {
      population[i].update()
    }
  }


}
//~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

//Key input for user controlled satellites
// function keyPressed() {
//   if(keyCode === LEFT_ARROW) {
//     satellite.leftThruster()
//   } else if(keyCode === RIGHT_ARROW) {
//     satellite.rightThruster()
//   } else if(keyCode === UP_ARROW) {
//     satellite.rearThruster()
//   } else if(keyCode === DOWN_ARROW) {
//     satellite.frontThruster()
//   }
// }
